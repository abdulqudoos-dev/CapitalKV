from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class CampaignStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class CampaignType(str, Enum):
    EMAIL = "email"
    SOCIAL = "social"
    SMS = "sms"
    PUSH = "push"

class TargetAudience(BaseModel):
    age_range: Optional[List[int]]
    gender: Optional[List[str]]
    location: Optional[List[str]]
    interests: Optional[List[str]]
    custom_segments: Optional[List[str]]

class CampaignContent(BaseModel):
    subject: Optional[str]
    body: str
    media_urls: Optional[List[HttpUrl]]
    call_to_action: Optional[Dict[str, str]]

class CampaignSchedule(BaseModel):
    start_date: datetime
    end_date: Optional[datetime]
    time_zones: Optional[List[str]]
    frequency: Optional[str]

class CampaignCreate(BaseModel):
    name: str
    description: Optional[str]
    campaign_type: CampaignType
    target_audience: TargetAudience
    content: CampaignContent
    schedule: CampaignSchedule
    budget: Optional[float]
    tags: Optional[List[str]]

class Campaign(CampaignCreate):
    id: str
    user_id: str
    status: CampaignStatus = CampaignStatus.DRAFT
    created_at: datetime
    updated_at: datetime
    metrics: Optional[Dict] = {}

class CampaignUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    target_audience: Optional[TargetAudience]
    content: Optional[CampaignContent]
    schedule: Optional[CampaignSchedule]
    budget: Optional[float]
    tags: Optional[List[str]]
    status: Optional[CampaignStatus]

class CampaignMetrics(BaseModel):
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    engagement_rate: float = 0.0
    roi: float = 0.0