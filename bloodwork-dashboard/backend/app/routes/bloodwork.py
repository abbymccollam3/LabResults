from fastapi import APIRouter, HTTPException
from elevenlabs import generate, save
import os
from app.clients import supabase_client
from typing import List, Dict
from dotenv import load_dotenv
import os

load_dotenv()
ELEVEN_LABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

router = APIRouter()

@router.get("/ping")
async def get_ping():
    return {"ping": "pong"}

@router.get("/primary-concerns")
async def get_primary_concerns():
    try:
        # Fetch the lab results with concerns (assuming `status != "normal"`)
        response = (
            supabase_client.table("bloodwork")
            .select("name", "value", "unit", "status", "audio_url")  # Include audio_url
            .neq("status", "normal")  # Only concerned results (e.g., abnormal status)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="No primary concerns found.")

        return response.data  # Return all the lab results with the audio_url

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{metric_id}")
async def get_bloodwork(metric_id: int) -> List[Dict]:
    try:

        response = (
            supabase_client.table("bloodwork")  # Name of the bloodwork table
            .select("name", "value", "unit", "status")  # Select only the 'name' column (e.g., "Sodium")
            .eq("metric_id", metric_id)  # Filter by metric_id
            .limit(1)  # Limit to the most recent record
            .execute()  # Execute the query
        )

        # Log the response for debugging
        print(f"Response from Supabase: {response}")  # Log the full response to inspect any issues
        print(f"Response data: {response.data}")  # Log the data from the response

        if not response.data:
            raise HTTPException(status_code=404, detail="Bloodwork not found for this patient.")
        
        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/generate-voice/{metric_id}")
async def generate_voice_explanation(metric_id: int):
    try:

        metric_id_int = int(metric_id)
        metric = supabase_client.table("bloodwork").select("*").eq("metric_id", metric_id_int).execute()

        # Check if the query returned no results
        if not metric.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        # If multiple rows are returned (which shouldn't happen if IDs are unique)
        if len(metric.data) > 1:
            raise HTTPException(status_code=400, detail="Multiple rows found for the same metric ID")

        # Now you can access the single metric data
        metric_data = metric.data[0]  # First row (since there is only one result)
        
        # Generate explanation text
        explanation = f"Your {metric_data['name']} level is {metric_data['value']} {metric_data['unit']}. "
        if metric_data['status'] == 'normal':
            explanation += "This is within the normal range."
        else:
            explanation += f"This is {metric_data['status']} the normal range and may require attention."

        print("Right here")
        # Generate voice using ElevenLabs
        audio = generate(
            text=explanation,
            voice="Josh",
            model="eleven_monolingual_v1",
            api_key=ELEVEN_LABS_API_KEY
        )

        # Save the audio file temporarily to a local directory
        filename = f"temp_{metric_id}.mp3"
        save(audio, filename)

        # Upload the audio file to Supabase storage
        bucket_name = "audio-files"  # Replace with your bucket name
        file_path = f"{metric_id}/{filename}"  # File path inside the bucket
        
        # Upload the file
        file = supabase_client.storage.from_(bucket_name).upload(file_path, filename)

        # Check if the file was uploaded successfully
        if not file:
            raise HTTPException(status_code=500, detail="Failed to upload audio to Supabase storage")

        if file:
            print("File was successful")
            # Generate a public URL to access the audio
            audio_url = supabase_client.storage.from_(bucket_name).get_public_url(file_path)
        
            # Delete the local file after uploading it to Supabase
            os.remove(filename)

            # Now update the bloodwork record with the new audio_url
            updated_record = supabase_client.table("bloodwork").update({"audio_url": audio_url}).eq("metric_id", metric_id).execute()

            if not updated_record.data:
                raise HTTPException(status_code=500, detail="Failed to update the audio URL in the database")

            # Return the audio URL
            return {"audio_url": audio_url}

        else:
            raise HTTPException(status_code=500, detail="Failed to upload audio to Supabase storage")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------------------------------------------------------------------
    

# @router.post("/generate-voice/{metric_id}")
# async def generate_voice_explanation(metric_id: int):
#     try:

#         metric_id_int = int(metric_id)
#         metric = supabase_client.table("bloodwork").select("*").eq("metric_id", metric_id_int).execute()

#         # Check if the query returned no results
#         if not metric.data:
#             raise HTTPException(status_code=404, detail="Metric not found")

#         # If multiple rows are returned (which shouldn't happen if IDs are unique)
#         if len(metric.data) > 1:
#             raise HTTPException(status_code=400, detail="Multiple rows found for the same metric ID")

#         # Now you can access the single metric data
#         metric_data = metric.data[0]  # First row (since there is only one result)
        
#         # Generate explanation text
#         explanation = f"Your {metric_data['name']} level is {metric_data['value']} {metric_data['unit']}. "
#         if metric_data['status'] == 'normal':
#             explanation += "This is within the normal range."
#         else:
#             explanation += f"This is {metric_data['status']} the normal range and may require attention."

#         print("Right here")
#         # Generate voice using ElevenLabs
#         audio = generate(
#             text=explanation,
#             voice="Josh",
#             model="eleven_monolingual_v1",
#             api_key=ELEVEN_LABS_API_KEY
#         )
#         print("Now here")
#         # Save the audio file temporarily to a local directory
#         filename = f"temp_{metric_id}.mp3"
#         save(audio, filename)

#         # Upload the audio file to Supabase storage
#         bucket_name = "audio-files"  # Replace with your bucket name
#         file_path = f"{metric_id}/{filename}"  # File path inside the bucket
        
#         # Upload the file
#         file = supabase_client.storage.from_(bucket_name).upload(file_path, filename)

#                 # Log the response to see if the file is uploaded correctly
#         print("Upload Response:", file)

#         # Check if the file was uploaded successfully
#         if not file:
#             raise HTTPException(status_code=500, detail="Failed to upload audio to Supabase storage")

#         print("Right before file was successful")
#         if file:
#             print("File was successful")
#             # Generate a public URL to access the audio
#             audio_url = supabase_client.storage.from_(bucket_name).get_public_url(file_path)["publicURL"]
        
#             # Delete the local file after uploading it to Supabase
#             os.remove(filename)

#             # Now update the bloodwork record with the new audio_url
#             updated_record = supabase_client.table("bloodwork").update({"audio_url": audio_url}).eq("metric_id", metric_id).execute()

#             if not updated_record.data:
#                 raise HTTPException(status_code=500, detail="Failed to update the audio URL in the database")

#             # Return the audio URL
#             return {"audio_url": audio_url}

#         else:
#             raise HTTPException(status_code=500, detail="Failed to upload audio to Supabase storage")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))