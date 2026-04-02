from fastapi import APIRouter
from app.services.google_places import get_nearby_doctors

router = APIRouter()

@router.get("/doctors")
def get_doctors(lat: float, lng: float):
    return get_nearby_doctors(lat, lng)