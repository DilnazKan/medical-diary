from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional

ENV_FILE = Path(__file__).resolve().parents[3] / ".env"

class Settings(BaseSettings):
    DATABASE_URL: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: int = 5432
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: str = "postgres"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    def get_database_url(self) -> str:
        if self.DB_HOST and self.DB_USER and self.DB_PASSWORD:
            from sqlalchemy.engine import URL
            return URL.create(
                drivername="postgresql+psycopg2",
                username=self.DB_USER,
                password=self.DB_PASSWORD,
                host=self.DB_HOST,
                port=self.DB_PORT,
                database=self.DB_NAME,
            )
        return self.DATABASE_URL

    class Config:
        env_file = str(ENV_FILE)

settings = Settings()
