from pydantic_settings import BaseSettings
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parents[3] / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    class Config:
        env_file = str(ENV_FILE)

settings = Settings()
