from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from odmantic import Model
import secrets

class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenWithRefreshToken(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class Email(BaseModel):
    email: EmailStr

class RefreshToken(Model):
    token: str
    expiry: datetime
    user_email: EmailStr

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: EmailStr
    is_admin_user:bool = False
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class PasswordReset(BaseModel):
    email: EmailStr

class NewPassword(BaseModel):
    token: str
    new_password: str

# Generate a secure password reset token
def generate_password_reset_token() -> str:
    return secrets.token_urlsafe(32)  # Generates a random, URL-safe token

class PasswordResetToken(Model):
    email: EmailStr  # Email of the user requesting the password reset
    token: str       # The reset token itself
    created_at: datetime  # Timestamp of when the token was created
