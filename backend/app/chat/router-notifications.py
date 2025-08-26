from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Example of Email notification utility
async def send_email_notification(receiver_email: str, message: str):
    """
    Sends an email notification to the user when a new message is received.
    """
    sender_email = "no-reply@example.com"  # Use your own email server
    password = "your_email_password"  # Your email server password

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = "New Message Notification"
    
    body = f"You have a new message: {message}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connect to your SMTP server
        server = smtplib.SMTP('smtp.example.com', 587)  # Use your SMTP server details
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, msg.as_string())
        server.close()
        print(f"Email sent to {receiver_email}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
