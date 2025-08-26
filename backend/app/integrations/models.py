from pydantic import BaseModel, HttpUrl
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class IntegrationType(str, Enum):
    EMAIL = "email"
    SOCIAL_MEDIA = "social_media"
    ANALYTICS = "analytics"
    CRM = "crm"
    SMS = "sms"
    ADVERTISING = "advertising"

class IntegrationProvider(str, Enum):
    # Email providers
    MAILCHIMP = "mailchimp"
    SENDGRID = "sendgrid"
    MAILGUN = "mailgun"
    
    # Social media platforms
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    INSTAGRAM = "instagram"
    
    # Analytics platforms
    GOOGLE_ANALYTICS = "google_analytics"
    MIXPANEL = "mixpanel"
    
    # CRM systems
    SALESFORCE = "salesforce"
    HUBSPOT = "hubspot"
    
    # SMS providers
    TWILIO = "twilio"
    MESSAGEBIRD = "messagebird"
    
    # Advertising platforms
    GOOGLE_ADS = "google_ads"
    FACEBOOK_ADS = "facebook_ads"

class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    FAILED = "failed"

class IntegrationCreate(BaseModel):
    name: str
    description: Optional[str]
    integration_type: IntegrationType
    provider: IntegrationProvider
    credentials: Dict[str, str]
    settings: Optional[Dict[str, str]]
    webhook_url: Optional[HttpUrl]

class IntegrationUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    credentials: Optional[Dict[str, str]]
    settings: Optional[Dict[str, str]]
    webhook_url: Optional[HttpUrl]
    status: Optional[IntegrationStatus]

class Integration(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    integration_type: IntegrationType
    provider: IntegrationProvider
    credentials: Dict[str, str]
    settings: Optional[Dict[str, str]]
    webhook_url: Optional[HttpUrl]
    status: IntegrationStatus
    created_at: datetime
    updated_at: datetime
    last_sync: Optional[datetime]
    error_message: Optional[str]

class IntegrationTestResult(BaseModel):
    success: bool
    message: str
    details: Optional[Dict[str, str]]

class IntegrationMetrics(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time: float
    last_sync_status: bool
    error_rate: float