from fastapi import FastAPI
from app.routes import doctors, auth, diary, medical, search

app = FastAPI(title="Medical Diary API")

app.include_router(auth.router)
app.include_router(diary.router)
app.include_router(medical.router)
app.include_router(search.router)
app.include_router(doctors.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Medical Diary API is running"}
