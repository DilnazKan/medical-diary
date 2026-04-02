from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

VALID_RECORD_TYPES = {"blood", "scan", "xray", "consultation", "other"}

class MedicalRecordCreate(BaseModel):
    title: str
    record_type: str  # blood, scan, xray, consultation, other
    visit_date: date
    doctor_name: Optional[str] = None
    clinic_name: Optional[str] = None
    notes: Optional[str] = None

class MedicalFileResponse(BaseModel):
    id: int
    file_name: str
    file_url: str
    file_type: Optional[str]
    file_size_kb: Optional[int]
    uploaded_at: datetime

    class Config:
        from_attributes = True

class MedicalRecordResponse(BaseModel):
    id: UUID
    title: str
    record_type: str
    visit_date: date
    doctor_name: Optional[str]
    clinic_name: Optional[str]
    notes: Optional[str]
    created_at: datetime
    files: List[MedicalFileResponse]

    class Config:
        from_attributes = True
