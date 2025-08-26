from datetime import datetime
from enum import Enum
from odmantic import Model, Field as ODMField
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict
from bson import ObjectId


class NotificationType(str, Enum):
    """
    Enum for different types of notifications.
    """
    ORDER = "order"
    SUBSCRIPTION = "subscription"
    PROMOTION = "promotion"
    SYSTEM = "system"
    OTHER = "other"

class UserNotification(Model):
    """
    Represents a notification sent to a user.
    """
    user_id: str = ODMField(..., description="The ID of the user who receives the notification.")
    type: NotificationType = ODMField(..., description="The category/type of the notification.")
    title: str = ODMField(..., description="Title or subject of the notification.")
    message: str = ODMField(..., description="Detailed content of the notification.")
    read: bool = ODMField(default=False, description="Whether the notification has been read.")
    data: Optional[Dict[str, str]] = ODMField(None, description="Optional metadata, like order_id or redirect URL.")
    created_at: datetime = ODMField(default_factory=datetime.utcnow, description="Time when the notification was created.")
    updated_at: datetime = ODMField(default_factory=datetime.utcnow, description="Time when the notification was last updated.")


class Notification(BaseModel):
    """
    Represents a notification sent to a user.
    """
    id: Optional[str] = Field(None, alias="_id", description="MongoDB ObjectId for the notification.")
    user_id: str = Field(..., description="The ID of the user who receives the notification.")
    type: NotificationType = Field(..., description="The category/type of the notification.")
    title: str = Field(..., description="Title or subject of the notification.")
    message: str = Field(..., description="Detailed content of the notification.")
    read: bool = Field(default=False, description="Whether the notification has been read.")
    data: Optional[Dict[str, str]] = Field(None, description="Optional metadata, like order_id or redirect URL.")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Time when the notification was created.")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Time when the notification was last updated.")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    