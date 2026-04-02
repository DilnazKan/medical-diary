from pydantic import BaseModel, field_serializer
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class SymptomInput(BaseModel):
    symptom_id: Optional[int] = None
    custom_symptom: Optional[str] = None
    severity: int  # 1-10

class DiaryEntryCreate(BaseModel):
    notes: Optional[str] = None
    symptoms: List[SymptomInput] = []

class SymptomResponse(BaseModel):
    id: int
    symptom_id: Optional[int]
    custom_symptom: Optional[str]
    severity: int

    class Config:
        from_attributes = True

class DiaryEntryResponse(BaseModel):
    id: UUID
    notes: Optional[str]
    logged_at: datetime
    symptoms: List[SymptomResponse]

    class Config:
        from_attributes = True
