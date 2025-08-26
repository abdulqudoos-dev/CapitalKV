from app.database import db
from app.users.utils import update_user_profile
from fastapi import HTTPException
from app.config import settings
import stripe
import os
stripe.api_key = settings.stripe_api_key

async def generate_customer_id(userEmail: str):
    try:
        customer = stripe.Customer.create(
            email=userEmail,
        )
        
        await update_user_profile(userEmail, {"customer_id": customer.id})
        
        return customer.id
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        
