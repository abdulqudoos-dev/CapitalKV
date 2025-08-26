from app.database import db  # your Motor client instance
from fastapi import HTTPException, status
from pymongo import ReturnDocument

async def update_user_profile(email: str, update_data: dict) -> dict:
    """
    Updates the user's profile in the MongoDB `users` collection by email.
    
    Args:
        email (str): User's email.
        update_data (dict): Fields to update.
    
    Returns:
        dict: The updated user document.

    Raises:
        HTTPException: If user not found or DB error occurs.
    """
    try:
        updated_user = await db["users"].find_one_and_update(
            {"email": email},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email '{email}' not found."
            )
        return updated_user
    except Exception as e:
        print(f"Database error during user profile update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile."
        )
