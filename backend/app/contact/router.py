from fastapi import APIRouter, HTTPException, status, Depends
from app.contact.models import ContactForm
from app.contact.utils import send_contact_email
from app.database import db

contact_router = APIRouter()

@contact_router.post("/", status_code=status.HTTP_201_CREATED)
async def contact_us(contact_form: ContactForm):
    """
    Handles the contact form submission by saving the data to the database
    and sending a notification email.

    Args:
        contact_form (ContactForm): The form data containing name, email, and message.

    Returns:
        dict: Success message on successful submission.
    """
    try:
        # Save contact form data to the database
        contact_entry = ContactForm(
            name=contact_form.name,
            email=contact_form.email,
            message=contact_form.message
        )
        await db.engine.save(contact_entry)

        # Send notification email
        try:
            await send_contact_email(
                user_email=contact_form.email,
                user_name=contact_form.name,
                user_message=contact_form.message
            )
        except Exception as email_error:
            # Log email sending error (optional: integrate a logger)
            print(f"Failed to send email: {email_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send confirmation email. Please try again later."
            )

        return {"message": "Thank you for contacting us! We will get back to you soon."}
    except Exception as e:
        # Log database saving error (optional: integrate a logger)
        print(f"Error occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request. Please try again later."
        )
