import smtplib
from email.message import EmailMessage
from app.config import settings


async def send_contact_email(user_email: str, user_name: str, user_message: str) -> str:
    """
    Sends emails for a contact request: a confirmation to the user and a notification to the admin.

    Args:
        user_email (str): The email address of the user.
        user_name (str): The name of the user.
        user_message (str): The message from the user.

    Returns:
        str: Confirmation message on success.

    Raises:
        Exception: If an error occurs during email sending.
    """
    # Retrieve email configuration from settings
    email_address = settings.sender_email_address
    email_password = settings.sender_email_password
    receiver_email = settings.receiver_email_address

    # Validate that all required settings are provided
    if not all([email_address, email_password, receiver_email]):
        raise ValueError("Email credentials or receiver email address are not properly configured.")

    # Create the admin notification email
    admin_msg = EmailMessage()
    admin_msg['Subject'] = f"New Contact Us Message from {user_name}"
    admin_msg['From'] = email_address
    admin_msg['To'] = email_address
    admin_msg.set_content(
        f"New Contact Us Message Received:\n\n"
        f"Name: {user_name}\n"
        f"Email: {user_email}\n"
        f"Message:\n{user_message}"
    )

    # Create the user confirmation email
    user_msg = EmailMessage()
    user_msg['Subject'] = "Confirmation: We Received Your Message"
    user_msg['From'] = email_address
    user_msg['To'] = user_email
    user_msg.set_content(
        f"Hello {user_name},\n\n"
        f"Thank you for reaching out to us. We have received your message:\n\n"
        f"{user_message}\n\n"
        f"Our team will get back to you shortly.\n\n"
        f"Best regards,\n"
        f"The Support Team"
    )

    # Send both emails
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(email_address, email_password)

            # Send admin notification email
            smtp.send_message(admin_msg)

            # Send user confirmation email
            smtp.send_message(user_msg)

        return "Emails successfully sent to both user and admin."
    except smtplib.SMTPAuthenticationError as e:
        print(f"Authentication failed: {e.smtp_code} - {e.smtp_error}")
        raise Exception("Failed to authenticate with the SMTP server. Check your credentials or Gmail settings.") from e
    except smtplib.SMTPException as e:
        print(f"SMTP error occurred: {e}")
        raise Exception("An error occurred while sending the email.") from e
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        raise Exception("Failed to send the email due to an unexpected error.") from e
