from fastapi import APIRouter, HTTPException, BackgroundTasks
from elevenlabs import generate, save
import os
from app.clients import supabase_client, openai_client
from typing import List, Dict
from dotenv import load_dotenv
import os
# import openai

load_dotenv()
ELEVEN_LABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

router = APIRouter()

@router.get("/ping")
async def get_ping():
    return {"ping": "pong"}


@router.post("/add-bloodwork")
async def add_bloodwork(data: List[Dict], background_tasks: BackgroundTasks):  # Expecting an array of records
    try:
        bloodwork_data = []
        
        for record in data:
            # Retrieve metric_id from metrics table using the metric_name
            metric_name = record["metric_name"]
            metric = supabase_client.table("metrics").select("metric_id").eq("metric_name", metric_name).execute()

            if not metric.data:
                raise HTTPException(status_code=404, detail=f"Metric '{metric_name}' not found")

            metric_id = metric.data[0]["metric_id"]

            # Prepare the bloodwork record with the corresponding metric_id
            bloodwork_data.append({
                "metric_id": metric_id,
                "patient_id": record["patient_id"],  # Assuming patient_id is passed in the record
                "value": record["value"],
                "status": record["status"]
            })

        # Insert all bloodwork records into the database
        bloodwork = supabase_client.table("bloodwork").insert(bloodwork_data).execute()

        if not bloodwork.data:
            raise HTTPException(status_code=500, detail="Failed to insert bloodwork data")

        # Process each metric in the background
        for record in bloodwork.data:
            metric_id = record["metric_id"]
            # Add process_voice_generation as a background task
            background_tasks.add_task(process_voice_generation, metric_id)

        return {"message": f"{len(bloodwork.data)} bloodwork records added and voice explanations generated."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/primary-concerns")
async def get_primary_concerns():
    try:
        # Fetch the metrics data (metric_id, metric_name, unit)
        metrics_response = supabase_client.table("metrics").select("metric_id, metric_name, unit, normal_range").execute()

        print("Metrics Response:", metrics_response)

        if not metrics_response.data:
            raise HTTPException(status_code=404, detail="No metrics found")
        
        # Fetch the bloodwork data (metric_id, value, status, audio_url)
        bloodwork_response = supabase_client.table("bloodwork").select("metric_id, value, status, audio_url").neq("status", "normal").execute()

        if not bloodwork_response.data:
            raise HTTPException(status_code=404, detail="No primary concerns found")
        
        # Combine the data by matching metric_id from both responses
        combined_data = []
        for bloodwork in bloodwork_response.data:
            # Find the matching metric for each bloodwork entry
            matching_metric = next((metric for metric in metrics_response.data if metric["metric_id"] == bloodwork["metric_id"]), None)
            if matching_metric:
                combined_data.append({
                    "metric_name": matching_metric["metric_name"],
                    "value": bloodwork["value"],
                    "status": bloodwork["status"],
                    "audio_url": bloodwork["audio_url"],
                    "unit": matching_metric["unit"],
                    "normalRange": matching_metric["normal_range"]
                })
        
        return combined_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/all")  # New route for all metrics
async def get_all_bloodwork():
    try:
        # Fetch all metrics from the metrics table
        metrics_response = supabase_client.table("metrics").select("metric_id, metric_name, unit").execute()

        if not metrics_response.data:
            raise HTTPException(status_code=404, detail="No metrics found")
        
        # Fetch all bloodwork records, including their metric_ids
        bloodwork_response = supabase_client.table("bloodwork").select("metric_id, value, status, audio_url").execute()

        if not bloodwork_response.data:
            raise HTTPException(status_code=404, detail="No bloodwork data found")
        
        # Combine the data from both responses
        combined_data = []
        for bloodwork in bloodwork_response.data:
            # Find the matching metric for each bloodwork entry
            matching_metric = next((metric for metric in metrics_response.data if metric["metric_id"] == bloodwork["metric_id"]), None)
            if matching_metric:
                combined_data.append({
                    "metric_name": matching_metric["metric_name"],
                    "value": bloodwork["value"],
                    "status": bloodwork["status"],
                    "audio_url": bloodwork["audio_url"],
                    "unit": matching_metric["unit"]
                })
        
        return combined_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-voice/{metric_id}")
async def generate_voice_explanation(metric_id: int, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_voice_generation, metric_id)
    return {"message": "Voice generation started in the background."}


async def process_voice_generation(metric_id: int):
    try:
        # Fetch metric details (name, unit, normal_range) from the metrics table
        metric = supabase_client.table("metrics").select("metric_name", "unit", "normal_range").eq("metric_id", metric_id).execute()

        if not metric.data:
            raise HTTPException(status_code=404, detail="Metric not found")
        
        metric_data = metric.data[0]  # Access the metric data (name, unit, normal_range)
        
        # Fetch the latest bloodwork record for the given metric_id
        bloodwork = supabase_client.table("bloodwork").select("value", "status").eq("metric_id", metric_id).order("timestamp", desc=True).limit(1).execute()

        if not bloodwork.data:
            raise HTTPException(status_code=404, detail="Bloodwork data not found")
        
        record_data = bloodwork.data[0]  # Get the most recent bloodwork record

        # Prepare the explanation text
        #explanation_prompt = f"Your {metric_data['metric_name']} level is {record_data['value']} {metric_data['unit']}. "
        if record_data['status'] == 'normal':
            explanation_prompt = "This is within the normal range."
        else:
            explanation_prompt = f"""
            You are an expert in health metrics. Please explain the following:

            Metric: {metric_data['metric_name']}
            Current Level: {record_data['value']} {metric_data['unit']}
            Status: {record_data['status']}

            Provide the following details:
            1. Give a 1 sentence overview of the lab results. For example:
                Your {metric_data['metric_name']} level is too {record_data['status']}.
            2. Simply, in 1 sentence or less, what does this metric mean?
            2. Why is it important to monitor this metric?
            3. What are some actionable recommendations to get the current level to a normal level?
               For example, if there was a high glucose status, you should advise the patient to
               eat more fiber and exercise regularly. Remember to keep this concise.

            This is being fed to 11 Labs, which is a text to speech so it is reading everything verbatim.
            Respond in a clear and concise manner and include only text; there should be no numbers or
            special characters and the text to speech generator should be able to read your response easily.
            """

        completion = openai_client.chat.completions.create(
            model = "gpt-4o",
            messages = [
                {
                    "role": "developer", 
                    "content": "You are a helpful assistant." 
                },
                {
                    "role": "user",
                    "content": explanation_prompt
                }
            ]
        )
        
        # Get the generated text from OpenAI response
        generated_text = completion.choices[0].message.content.strip()

        # Print to check if the generated_text is a string
        print("Generated text:", generated_text)
        print("Type of generated_text:", type(generated_text))

        # Generate voice using ElevenLabs
        audio = generate(
            text=generated_text,
            voice="Josh",
            model="eleven_monolingual_v1",
            api_key=ELEVEN_LABS_API_KEY
        )

        # Save the audio file temporarily to a local directory
        filename = f"temp_{metric_id}.mp3"
        save(audio, filename)

        # Upload the audio file to Supabase storage
        bucket_name = "audio-files"
        file_path = f"{metric_id}/{filename}"

        print("Removing")
        supabase_client.storage.from_(bucket_name).remove([file_path])

        # Upload the file
        file = supabase_client.storage.from_(bucket_name).upload(file_path, filename)

        if file:
            # Generate a public URL to access the audio
            audio_url = supabase_client.storage.from_(bucket_name).get_public_url(file_path)
        
            # Delete the local file after uploading it to Supabase
            os.remove(filename)

            # Update the bloodwork record with the new audio_url
            updated_record = supabase_client.table("bloodwork").update({"audio_url": audio_url}).eq("metric_id", metric_id).execute()
            print(f"Record: {updated_record}")

            if not updated_record.data:
                raise HTTPException(status_code=500, detail="Failed to update the audio URL in the database")

            print("Successful upload")
            return {"audio_url": audio_url}
    
        else:
            raise HTTPException(status_code=500, detail="Failed to upload audio to Supabase storage")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# async def process_voice_generation(metric_id: int):
#     try:
#         metric = supabase_client.table("bloodwork").select("*").eq("metric_id", metric_id).execute()

#         # Check if the query returned no results
#         if not metric.data:
#             raise HTTPException(status_code=404, detail="Metric not found")
#             return

#         # If multiple rows are returned (which shouldn't happen if IDs are unique)
#         if len(metric.data) > 1:
#             raise HTTPException(status_code=400, detail="Multiple rows found for the same metric ID")

#         # Now you can access the single metric data
#         metric_data = metric.data[0]  # First row (since there is only one result)
        
#         # Generate explanation text
#         explanation_prompt = f"Your {metric_data['name']} level is {metric_data['value']} {metric_data['unit']}. "
#         if metric_data['status'] == 'normal':
#             explanation_prompt += "This is within the normal range."
#         else:
#             explanation_prompt += f"""
#             Can you explain what the {metric_data['name']} level represents, and why it's important to monitor it? 
#             The current value is {metric_data['value']} {metric_data['unit']}; can you provide actionable recommendations for the 
#             user on how to address the issue? For instance, if the value is high, what could be the potential causes, and what 
#             steps should the user take to correct it? If the value is low, what actions should the user consider to improve it?
#             """
        
#         # Generate voice using ElevenLabs
#         audio = generate(
#             text=explanation_prompt,
#             voice="Josh",
#             model="eleven_monolingual_v1",
#             api_key=ELEVEN_LABS_API_KEY
#         )

#         # Save the audio file temporarily to a local directory
#         filename = f"temp_{metric_id}.mp3"
#         save(audio, filename)

#         # Upload the audio file to Supabase storage
#         bucket_name = "audio-files"  # Replace with your bucket name
#         file_path = f"{metric_id}/{filename}"  # File path inside the bucket
        
#         # Upload the file
#         file = supabase_client.storage.from_(bucket_name).upload(file_path, filename)

#         if file:
#             # Generate a public URL to access the audio
#             audio_url = supabase_client.storage.from_(bucket_name).get_public_url(file_path)
        
#             # Delete the local file after uploading it to Supabase
#             os.remove(filename)

#             # Now update the bloodwork record with the new audio_url
#             supabase_client.table("bloodwork").update({"audio_url": audio_url}).eq("metric_id", metric_id).execute()

#             print("Successful upload")
#             # Return the audio URL
#             return {"audio_url": audio_url}
    
#         else:
#             print(f"Failed to update the audio URL with {metric_id} in the database")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



# @router.get("/{metric_id}")
# async def get_bloodwork(metric_id: int) -> List[Dict]:
#     try:

#         response = (
#             supabase_client.table("bloodwork")  # Name of the bloodwork table
#             .select("name", "value", "unit", "status")  # Select only the 'name' column (e.g., "Sodium")
#             .eq("metric_id", metric_id)  # Filter by metric_id
#             .limit(1)  # Limit to the most recent record
#             .execute()  # Execute the query
#         )

#         # Log the response for debugging
#         print(f"Response from Supabase: {response}")  # Log the full response to inspect any issues
#         print(f"Response data: {response.data}")  # Log the data from the response

#         if not response.data:
#             raise HTTPException(status_code=404, detail="Bloodwork not found for this patient.")
        
#         return response.data

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print(f"Eleven API: {ELEVEN_LABS_API_KEY}")