from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    is_admin: Optional[bool] = False

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    plan_id: Optional[str] = None

class PasswordRecoveryRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)
