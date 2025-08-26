from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env variables into the environment
load_dotenv()

BASE_DIR = Path(__file__).parent

class Settings(BaseSettings):
    mongodb_url: str = os.getenv('mongodb_url')
    database_name: str = os.getenv('database_name')
    secret_key: str = os.getenv('secret_key')
    algorithm: str = os.getenv('algorithm')
    access_token_expire_minutes: int = os.getenv('access_token_expire_minutes')
    refresh_token_expire_days: int = os.getenv('refresh_token_expire_days')
    token_expire_hours: int = os.getenv('token_expire_hours')
    email_username_api_key: str = os.getenv('email_username_api_key')
    email_password_api_key: str = os.getenv('email_password_api_key')
    receiver_email_address: str = os.getenv('receiver_email_address')
    stripe_api_key: str = os.getenv('stripe_api_key')   
    backend_url: str = os.getenv('backend_url')
    frontend_url: str = os.getenv('frontend_url', 'https://capitalkv.com')
    frontend_base_url: str = os.getenv('frontend_base_url', 'https://capitalkv.com')
    coinbase_commerce_api_key: str = os.getenv('coinbase_commerce_api_key')
    sender_email_address: str = os.getenv('sender_email_address')
    sender_email_password: str = os.getenv('sender_email_password')  # Add these fields
    stripe_webhook_secret: str = os.getenv('stripe_webhook_secret')
    class Config:
        env_file = BASE_DIR / ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
