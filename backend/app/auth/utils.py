# # new code

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.users.models import User
from app.auth.models import RefreshToken
from app.database import db
from app.config import settings
from typing import Optional
from app.auth.dependencies import oauth2_scheme
import smtplib
from email.message import EmailMessage

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Generate JWT token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


# Create Refresh Token
def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=settings.refresh_token_expire_days))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

# Store Refresh Token
async def store_refresh_token(token: str, user_email: str):
    expiry = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])["exp"]
    await db.engine.save(RefreshToken(token=token, expiry=datetime.utcfromtimestamp(expiry), user_email=user_email))

# Revoke Refresh Token
async def revoke_refresh_token(token: str):
    # Find and delete the refresh token from the database
    refresh_token = await db.engine.find_one(RefreshToken, RefreshToken.token == token)
    if refresh_token:
        await db.engine.delete(refresh_token)  # Use delete method instead of delete_one


# Validate Refresh Token
async def validate_refresh_token(token: str):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        token_data = await db.engine.find_one(RefreshToken, RefreshToken.token == token)
        if token_data is None or token_data.expiry < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
        return payload["sub"]  # User email
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

# Retrieve user by email
async def get_user(email: str):
    return await db.engine.find_one(User, User.email == email)

# Verify user's credentials
async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if user and pwd_context.verify(password, user.hashed_password):
        return user
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user = await db.engine.find_one(User, User.email == email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user. Please contact support."
        )
    return current_user

async def send_reset_password_email(user_email: str, user_name: str,user_password:str):
    email_address = settings.sender_email_address  # Sender email address
    email_password = settings.sender_email_password  # App password for Gmail
     #http:127.0.0.1
    # Construct the reset password link 
    reset_token_data={
          "user_email":user_email,
          "user_password":user_password
        }
    reset_token=create_refresh_token(reset_token_data,timedelta(hours=1))
    store_refresh_token(reset_token_data,timedelta(hours=1))

   
    reset_password_url = f"https://capitalkv.com/auth/reset-password?token={reset_token}" 
    
    
    # Create email
    msg = EmailMessage()
    msg['Subject'] = "Reset Your Password"
    msg['From'] = email_address
    msg['To'] = user_email  # Recipient email address
    msg.set_content(
        f"""\
          Hi {user_name},

          We received a request to reset your password. Click the link below to set a new password:

          Reset Password Link: {reset_password_url}

          If you did not request a password reset, please ignore this email or contact support if you have concerns.

          Thank you,
          The Support Team
          """
    )
    # Send email
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(email_address, email_password)
        smtp.send_message(msg)
    return "Reset password email successfully sent"
