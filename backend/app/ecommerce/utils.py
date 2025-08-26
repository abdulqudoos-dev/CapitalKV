from app.database import db
from app.users.utils import update_user_profile # Assuming this utility exists
from fastapi import HTTPException, status
from app.config import settings
import stripe
import os

stripe.api_key = settings.stripe_api_key

async def generate_customer_id(user_email: str):
    """
    Generates a Stripe Customer ID for a given user email and updates the user's profile.
    """
    try:
        customer = stripe.Customer.create(
            email=user_email,
            # Add any other initial customer details you want to store
        )
        
        # Make sure update_user_profile correctly handles updating the User model in MongoDB
        # It should typically take a user identifier (like email or user ID) and a dictionary of fields to update.
        await update_user_profile(user_email, {"customer_id": customer.id})
        
        return customer.id
    except Exception as e:
        print(f"Error generating Stripe customer ID: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))