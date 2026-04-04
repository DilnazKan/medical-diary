from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import doctors, auth, diary, medical, search, symptoms

app = FastAPI(title="Medical Diary API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(diary.router)
app.include_router(medical.router)
app.include_router(search.router)
app.include_router(symptoms.router)
app.include_router(doctors.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Medical Diary API is running"}
