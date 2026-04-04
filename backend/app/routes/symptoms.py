from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.diary import Symptom

router = APIRouter(prefix="/symptoms", tags=["symptoms"])

INITIAL_SYMPTOMS = [
    # General
    {"name": "Fatigue", "category": "General"},
    {"name": "Fever", "category": "General"},
    {"name": "Chills", "category": "General"},
    {"name": "Night sweats", "category": "General"},
    {"name": "Weight loss", "category": "General"},
    {"name": "Weight gain", "category": "General"},
    {"name": "Loss of appetite", "category": "General"},
    {"name": "Weakness", "category": "General"},

    # Neurological
    {"name": "Headache", "category": "Neurological"},
    {"name": "Migraine", "category": "Neurological"},
    {"name": "Dizziness", "category": "Neurological"},
    {"name": "Brain fog", "category": "Neurological"},
    {"name": "Memory problems", "category": "Neurological"},
    {"name": "Numbness", "category": "Neurological"},
    {"name": "Tingling", "category": "Neurological"},

    # Digestive
    {"name": "Nausea", "category": "Digestive"},
    {"name": "Vomiting", "category": "Digestive"},
    {"name": "Bloating", "category": "Digestive"},
    {"name": "Stomach pain", "category": "Digestive"},
    {"name": "Diarrhea", "category": "Digestive"},
    {"name": "Constipation", "category": "Digestive"},
    {"name": "Heartburn", "category": "Digestive"},

    # Respiratory
    {"name": "Cough", "category": "Respiratory"},
    {"name": "Shortness of breath", "category": "Respiratory"},
    {"name": "Chest tightness", "category": "Respiratory"},
    {"name": "Runny nose", "category": "Respiratory"},
    {"name": "Sore throat", "category": "Respiratory"},

    # Musculoskeletal
    {"name": "Joint pain", "category": "Musculoskeletal"},
    {"name": "Muscle pain", "category": "Musculoskeletal"},
    {"name": "Back pain", "category": "Musculoskeletal"},
    {"name": "Neck pain", "category": "Musculoskeletal"},
    {"name": "Stiffness", "category": "Musculoskeletal"},

    # Skin
    {"name": "Rash", "category": "Skin"},
    {"name": "Itching", "category": "Skin"},
    {"name": "Acne", "category": "Skin"},
    {"name": "Dry skin", "category": "Skin"},
    {"name": "Hair loss", "category": "Skin"},

    # Mental health
    {"name": "Anxiety", "category": "Mental Health"},
    {"name": "Depression", "category": "Mental Health"},
    {"name": "Mood swings", "category": "Mental Health"},
    {"name": "Insomnia", "category": "Mental Health"},
    {"name": "Irritability", "category": "Mental Health"},
    {"name": "Panic attacks", "category": "Mental Health"},

    # Hormonal / Women's health
    {"name": "Irregular periods", "category": "Hormonal"},
    {"name": "Painful periods", "category": "Hormonal"},
    {"name": "PMS symptoms", "category": "Hormonal"},
    {"name": "Hot flashes", "category": "Hormonal"},
    {"name": "Low libido", "category": "Hormonal"},
    {"name": "Pelvic pain", "category": "Hormonal"},

    # Cardiovascular
    {"name": "Heart palpitations", "category": "Cardiovascular"},
    {"name": "Chest pain", "category": "Cardiovascular"},
    {"name": "Swollen legs", "category": "Cardiovascular"},
    {"name": "High blood pressure", "category": "Cardiovascular"},
]

@router.post("/seed", status_code=201)
def seed_symptoms(db: Session = Depends(get_db)):
    added = 0
    for s in INITIAL_SYMPTOMS:
        exists = db.query(Symptom).filter(Symptom.name == s["name"]).first()
        if not exists:
            db.add(Symptom(name=s["name"], category=s["category"]))
            added += 1
    db.commit()
    return {"message": f"Seeded {added} symptoms successfully"}

@router.get("")
def get_symptoms(category: str = None, db: Session = Depends(get_db)):
    query = db.query(Symptom)
    if category:
        query = query.filter(Symptom.category == category)
    symptoms = query.order_by(Symptom.category, Symptom.name).all()
    return [{"id": s.id, "name": s.name, "category": s.category} for s in symptoms]
