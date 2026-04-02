from pydantic import BaseModel, EmailStr
from datetime import date

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    date_of_birth: date | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None

    class Config:
        from_attributes = True
