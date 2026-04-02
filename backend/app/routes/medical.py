import os
import shutil
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.medical import MedicalRecord, MedicalFile
from app.schemas.medical import MedicalRecordCreate, MedicalRecordResponse, VALID_RECORD_TYPES

router = APIRouter(prefix="/medical-records", tags=["medical records"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=MedicalRecordResponse, status_code=201)
def create_record(
    body: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if body.record_type not in VALID_RECORD_TYPES:
        raise HTTPException(status_code=400, detail=f"record_type must be one of: {', '.join(VALID_RECORD_TYPES)}")

    record = MedicalRecord(
        user_id=current_user.id,
        title=body.title,
        record_type=body.record_type,
        visit_date=body.visit_date,
        doctor_name=body.doctor_name,
        clinic_name=body.clinic_name,
        notes=body.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("", response_model=List[MedicalRecordResponse])
def get_records(
    record_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id)
    if record_type:
        query = query.filter(MedicalRecord.record_type == record_type)
    return query.order_by(MedicalRecord.visit_date.desc()).all()

@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_record(
    record_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.post("/{record_id}/files", response_model=MedicalRecordResponse)
def upload_file(
    record_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Save file to local uploads folder
    file_path = f"{UPLOAD_DIR}/{record_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_kb = os.path.getsize(file_path) // 1024
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else None

    db.add(MedicalFile(
        record_id=record_id,
        file_name=file.filename,
        file_url=file_path,
        file_type=file_ext,
        file_size_kb=file_size_kb
    ))
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}", status_code=204)
def delete_record(
    record_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
