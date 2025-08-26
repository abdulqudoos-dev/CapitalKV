from fastapi import File, UploadFile
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from odmantic import Model
from datetime import datetime
from typing import Optional
from bson import ObjectId


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UpdateUserStatusRequest(BaseModel):
    is_active: bool
    subscription:str

class UpdateSubscriptionRequest(BaseModel):
    subscription: str

class ManagaUserDetails(BaseModel):
    id: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_admin_user: bool = False
    phone_number: Optional[str] = None
    email: EmailStr
    is_active: bool = True
    subscription: str 


class UserProfile(BaseModel):

    full_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    is_admin_user: bool = False
    bio: Optional[str] = None
    profile_picture_url: UploadFile = File(None), 
    customer_id: Optional[str] = None
    balance: int = 0
    stripe_account_id: Optional[str] = None


class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone_number: Optional[str] = None
    is_admin_user: bool = False
    address: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    profile_picture_url: UploadFile = File(None),  # Logo can be null
    balance: int = 0
    stripe_account_id: Optional[str] = None


class UserActivity(BaseModel):
    activity_type: str
    timestamp: datetime
    details: Optional[dict] = None


class AccountDetails(BaseModel):
    customer_id: Optional[str] = None
    address: str
    iban: str


class Deposit(BaseModel):
    amount: int = (0,)


class WithDraw(BaseModel):
    amount: int = (0,)
    # iban: str


class UserStats(BaseModel):
    total_campaigns: int
    active_campaigns: int
    total_integrations: int
    last_login: Optional[datetime] = None
    account_created: datetime


class UserDetails(BaseModel):
    profile: UserProfile
    stats: UserStats
    recent_activity: List[UserActivity]


class User(Model):
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    hashed_password: str
    subscription: str = "free_trial"  # "free_trial", "premium"
    customer_id: Optional[str] = None  # Unique ID from the payment provider
    created_at: datetime = datetime.utcnow()
    is_active: bool = True
    is_developer: bool = False
    full_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    is_admin_user: bool = False
    payment_method_id: Optional[str] = None
    profile_picture_url: Optional[str] = None
    website: Optional[str] = None
    roles: Optional[List[str]] = None
    balance: float = 0
    stripe_account_id: Optional[str] = None
    model_config = ConfigDict(arbitrary_types_allowed=True)


class AffliliateLinks(Model):
    userId: ObjectId  # Unique ID from the payment provider
    created_at: datetime = datetime.utcnow()
    affiliate_link: str
    name: str
    model_config = ConfigDict(arbitrary_types_allowed=True)


class AffliliateTransactions(Model):
    user_id: ObjectId
    created_at: datetime = datetime.utcnow()
    affiliate_id: ObjectId
    subscription_id: Optional[str] = None
    amount: float = 0
    is_processed: bool = False
    processed_at: Optional[datetime] = None  # Use Optional instead of union syntax

    model_config = ConfigDict(arbitrary_types_allowed=True)


class Bussiness(Model):
    user_id: ObjectId
    created_at: datetime = datetime.utcnow()
    title: str
    description: str
    logo: Optional[str]  # Path or URL to the logo
    price: float = 0
    roi: float = 0
    status: str = "OPEN"
    fundSize: Optional[float]  =  None
    model_config = ConfigDict(arbitrary_types_allowed=True)


# Pydantic schema for request validation
class AffiliateLinkBase(BaseModel):
    userId: ObjectId
    affiliate_link: str
    name: str
    model_config = ConfigDict(arbitrary_types_allowed=True)


class AffiliateLinkCreate(AffiliateLinkBase):
    pass


class AffiliateLinkUpdate(BaseModel):
    affiliate_link: str
    name: str

    # Specify the collection name

    def is_free_trial(self) -> bool:
        return (
            datetime.utcnow() - self.created_at
        ).days <= 14 and self.subscription == "free_trial"

class Avatar(BaseModel):
    avatar_url: Optional[str] = None
