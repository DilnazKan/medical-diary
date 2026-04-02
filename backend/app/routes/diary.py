from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.diary import DiaryEntry, DiarySymptom
from app.schemas.diary import DiaryEntryCreate, DiaryEntryResponse

router = APIRouter(prefix="/diary", tags=["diary"])

@router.post("", response_model=DiaryEntryResponse, status_code=201)
def create_entry(
    body: DiaryEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate symptoms
    for s in body.symptoms:
        if s.symptom_id is None and not s.custom_symptom:
            raise HTTPException(status_code=400, detail="Each symptom needs a symptom_id or custom_symptom text")
        if s.severity < 1 or s.severity > 10:
            raise HTTPException(status_code=400, detail="Severity must be between 1 and 10")

    entry = DiaryEntry(user_id=current_user.id, notes=body.notes)
    db.add(entry)
    db.flush()

    for s in body.symptoms:
        db.add(DiarySymptom(
            diary_entry_id=entry.id,
            symptom_id=s.symptom_id,
            custom_symptom=s.custom_symptom,
            severity=s.severity
        ))

    db.commit()
    db.refresh(entry)
    return entry

@router.get("", response_model=List[DiaryEntryResponse])
def get_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(DiaryEntry)\
        .filter(DiaryEntry.user_id == current_user.id)\
        .order_by(DiaryEntry.logged_at.desc())\
        .all()
    return entries

@router.get("/{entry_id}", response_model=DiaryEntryResponse)
def get_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(DiaryEntry)\
        .filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id)\
        .first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry
