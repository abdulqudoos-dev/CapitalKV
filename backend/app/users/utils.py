from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from app.config import settings
from app.users.models import User
from app.database import db
from app.auth.dependencies import oauth2_scheme
from app.users.models import UserProfile, UserActivity, UserStats
from typing import Optional, List, Dict
from datetime import datetime
from passlib.context import CryptContext
import os
import logging

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

async def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    """
    return pwd_context.verify(plain_password, hashed_password)

async def get_password_hash(password: str) -> str:
    """
    Hash a password for storing
    """
    return pwd_context.hash(password)

async def verify_current_password(email: str, current_password: str) -> bool:
    """
    Verify user's current password
    """
    user = await db.engine.find_one(User, User.email == email)
    if not user:
        return False
    return await verify_password(current_password, user.hashed_password)

async def update_user_password(email: str, new_password: str) -> bool:
    """
    Update user's password
    """
    user = await db.engine.find_one(User, User.email == email)
    if not user:
        return False
    
    hashed_password = await get_password_hash(new_password)
    user.hashed_password = hashed_password
    await db.engine.save(user)
    return True

async def get_user_profile(email: str) -> Optional[UserProfile]:
    """
    Retrieves a user's profile by email.
    """
    user = await db.engine.find_one(User, User.email == email)
    if user:
        return user
    return None

async def update_user_profile(email: str, profile_data: Dict) -> Optional[UserProfile]:
    """
    Updates a user's profile and returns the updated profile.
    """
 
    existing_user = await db.engine.find_one(User, User.email == email)
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Handle password verification if included
    if "currentPassword" in profile_data:
        if not await verify_current_password(email, profile_data["currentPassword"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid current password")
        if "newPassword" in profile_data:
            await update_user_password(email, profile_data["newPassword"])
        return await get_user_profile(email)

    # Update fields if provided in profile_data
    for key, value in profile_data.items():
        if hasattr(existing_user, key):
            setattr(existing_user, key, value)

    # Save the updated user
    await db.engine.save(existing_user)
    
    # Return the updated profile
    return await get_user_profile(email)

async def get_user_stats(username: str) -> UserStats:
    """
    Retrieves user statistics such as campaigns and integrations.
    """
    campaign_stats = await db.engine.aggregate(
        User,
        [
            {"$match": {"username": username}},
            {"$group": {
                "_id": None,
                "total_campaigns": {"$sum": 1},
                "active_campaigns": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}}
            }},
        ],
    ).to_list(length=1)
    
    campaign_stats = campaign_stats[0] if campaign_stats else {"total_campaigns": 0, "active_campaigns": 0}
    total_integrations = await db.engine.count_documents({"user_id": username})
    user = await db.engine.find_one(User, User.username == username)
    
    return UserStats(
        total_campaigns=campaign_stats["total_campaigns"],
        active_campaigns=campaign_stats["active_campaigns"],
        total_integrations=total_integrations,
        last_login=user.last_login if user else None,
        account_created=user.created_at if user else datetime.utcnow(),
    )

async def get_user_recent_activity(username: str, limit: int = 10) -> List[UserActivity]:
    """
    Retrieves the user's recent activities.
    """
    activities = await db.engine.find(
        UserActivity,
        UserActivity.username == username,
        sort=UserActivity.timestamp.descending,
        limit=limit,
    )
    return activities

async def log_user_activity(username: str, activity_type: str, details: Optional[Dict] = None):
    """
    Logs a new activity for a user.
    """
    activity = UserActivity(
        username=username,
        activity_type=activity_type,
        timestamp=datetime.utcnow(),
        details=details or {},
    )
    await db.engine.save(activity)


async def get_image_path(avatar_url: str) -> Optional[str]:
    UPLOAD_FOLDER = "uploads" # or however your upload folder is defined.
    full_path = os.path.join(UPLOAD_FOLDER, avatar_url)

    if os.path.exists(full_path):
        return full_path
    return None


def delete_image(image_path: str):
    """Deletes an image file from the server."""
    try:
        if os.path.exists(image_path):
            os.remove(image_path)
            logging.info(f"Successfully deleted image: {image_path}")
        else:
            logging.warning(f"Image not found: {image_path}")
    except Exception as e:
        logging.error(f"Error deleting image {image_path}: {e}")
        raise
