from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.users.utils import get_current_user
from app.contact.utils import send_contact_email
from app.users.models import User
from app.support.billing.models import SupportBillingMessage
from app.database import db
from datetime import datetime

support_billing_router = APIRouter()

class SupportMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500, description="The support message content")

@support_billing_router.post("/message", status_code=status.HTTP_201_CREATED)
async def send_support_general_message(
    message_request: SupportMessageRequest,
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user cannot send messages")
    
    # Create a new support message
    support_billing_message = SupportBillingMessage(
        user_id=str(current_user.id),
        message=message_request.message,
        created_at=datetime.utcnow()
    )
    
    await db.engine.save(support_billing_message)
    
    # Attempt to send Notification Email
    try:
        await send_contact_email(
            user_email=current_user.email,
            user_name=current_user.username,
            user_message="Billing Support: " + message_request.message
        )
    except Exception as e:
        # Log the error or handle it accordingly
        print(f"Failed to send email notification: {e}")
    
    return {
        "message": "Support Billing Message sent successfully",
        "data": {
            "message_id": str(support_billing_message.id),
            "email": current_user.email,
            "message": support_billing_message.message,
            "created_at": support_billing_message.created_at
        }
    }
