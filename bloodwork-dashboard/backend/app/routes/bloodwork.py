from fastapi import APIRouter, HTTPException
from elevenlabs import generate, save
import os
from app.clients import supabase_client
from typing import List, Dict

router = APIRouter()

# Sample data - in real app this would come from database
bloodwork_data = {
    "example-patient-id": [
        {"id": 1, "name": "Sodium (Na)", "value": "140", "unit": "mEq/L", "status": "normal"},
        {"id": 2, "name": "Potassium (K)", "value": "4.0", "unit": "mEq/L", "status": "normal"},
        {"id": 3, "name": "Chloride (Cl)", "value": "102", "unit": "mEq/L", "status": "normal"},
        {"id": 4, "name": "Bicarbonate (CO2)", "value": "24", "unit": "mEq/L", "status": "normal"},
        {"id": 5, "name": "Blood Urea Nitrogen (BUN)", "value": "15", "unit": "mg/dL", "status": "normal"},
        {"id": 6, "name": "Creatinine", "value": "0.9", "unit": "mg/dL", "status": "normal"},
        {"id": 7, "name": "Glucose", "value": "95", "unit": "mg/dL", "status": "normal"},
        {"id": 8, "name": "Calcium", "value": "9.5", "unit": "mg/dL", "status": "normal"},
        {"id": 9, "name": "Total Protein", "value": "7.0", "unit": "g/dL", "status": "normal"},
        {"id": 10, "name": "Albumin", "value": "4.0", "unit": "g/dL", "status": "normal"},
        {"id": 11, "name": "Total Bilirubin", "value": "1.0", "unit": "mg/dL", "status": "normal"}
    ]
}

@router.get("/bloodwork/ping")
async def get_ping():
    return {"ping": "pong"}

@router.get("/{patient_id}")
async def get_bloodwork(patient_id: str) -> List[Dict]:
    if patient_id not in bloodwork_data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return bloodwork_data[patient_id]

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