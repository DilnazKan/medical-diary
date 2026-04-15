from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.medical import MedicalRecord, MedicalFile
from app.schemas.medical import MedicalRecordCreate, MedicalRecordResponse, VALID_RECORD_TYPES
from app.services.storage import upload_file, get_signed_url, delete_file

router = APIRouter(prefix="/medical-records", tags=["medical records"])

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
async def upload_file_endpoint(
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

    file_bytes = await file.read()
    file_size_kb = len(file_bytes) // 1024
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else None
    storage_path = f"{record_id}/{file.filename}"

    upload_file(file_bytes, storage_path, file.content_type or "application/octet-stream")

    db.add(MedicalFile(
        record_id=record_id,
        file_name=file.filename,
        file_url=storage_path,
        file_type=file_ext,
        file_size_kb=file_size_kb
    ))
    db.commit()
    db.refresh(record)
    return record

@router.get("/{record_id}/files/{file_id}/url")
def get_file_url(
    record_id: UUID,
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    medical_file = db.query(MedicalFile).filter(
        MedicalFile.id == file_id,
        MedicalFile.record_id == record_id
    ).first()
    if not medical_file:
        raise HTTPException(status_code=404, detail="File not found")

    signed_url = get_signed_url(medical_file.file_url)
    return {"url": signed_url, "file_name": medical_file.file_name}


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

    for f in record.files:
        try:
            delete_file(f.file_url)
        except Exception:
            pass

    db.delete(record)
    db.commit()
