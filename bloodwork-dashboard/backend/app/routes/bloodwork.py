from fastapi import APIRouter, HTTPException
from elevenlabs import generate, save
import os
from app.clients import supabase_client

router = APIRouter()

@router.get("/bloodwork/ping")
async def get_ping():
    return {"ping": "pong"}

@router.get("/bloodwork/{patient_id}")
async def get_bloodwork(patient_id: str):
    try:
        # Fetch top 20 blood metrics from Supabase
        response = supabase_client.table("bloodwork").select("*").eq("patient_id", patient_id).limit(20).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-voice/{metric_id}")
async def generate_voice_explanation(metric_id: str):
    try:
        # Fetch metric details from Supabase
        metric = supabase_client.table("bloodwork").select("*").eq("id", metric_id).single().execute()
        
        # Generate explanation text
        explanation = f"Your {metric.data['name']} level is {metric.data['value']} {metric.data['unit']}. "
        if metric.data['status'] == 'normal':
            explanation += "This is within the normal range."
        else:
            explanation += f"This is {metric.data['status']} the normal range and may require attention."

        # Generate voice using ElevenLabs
        audio = generate(
            text=explanation,
            voice="Josh",
            model="eleven_monolingual_v1"
        )
        
        # Save audio file temporarily
        filename = f"temp_{metric_id}.mp3"
        save(audio, filename)
        
        return {"audio_url": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 