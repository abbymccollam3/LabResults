from pydantic import BaseModel

class BloodMetric(BaseModel):
    id: str
    patient_id: str
    name: str
    value: float
    unit: str
    status: str
    range_low: float
    range_high: float 