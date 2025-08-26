from pydantic import BaseModel, Field,ConfigDict
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from odmantic import Model


class Group(Model):
    name: str
    created_by: Optional[ObjectId]=None  # User ID of the creator
    members: List[ObjectId] = []  # List of user IDs
    group_avatar_url: Optional[str] = None  # Group profile picture URL/path
    created_at: datetime =  datetime.utcnow()
    model_config = ConfigDict(arbitrary_types_allowed=True)


class GroupMember(Model):
    group_id: ObjectId  # ID of the group
    user_id: Optional[ObjectId]=None  # User being added
    added_at: datetime =   datetime.utcnow()
    model_config = ConfigDict(arbitrary_types_allowed=True)

class Message(Model):
    group_id: Optional[ObjectId] = None  # ID of the group
    user_id: Optional[ObjectId] = None  # User who sent this message
    receipt_id: Optional[ObjectId] = None  # Receipt ID of the message
    message: str  # Message being sent
    is_admin_message: bool = False
    group_name: Optional[str] = None
    created_at: datetime =   datetime.utcnow()
    model_config = ConfigDict(arbitrary_types_allowed=True)

