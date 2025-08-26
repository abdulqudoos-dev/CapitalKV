from datetime import datetime
from typing import List, Optional
from app.notifications.models import Notification, NotificationType
from bson import ObjectId
from pymongo.collection import Collection


async def create_notification(
    collection: Collection,
    user_id: str,
    type: NotificationType,
    title: str,
    message: str,
    data: Optional[dict] = None
) -> Notification:
    """
    Create and insert a new notification into the database.
    """
    now = datetime.utcnow()
    doc = {
        "user_id": user_id,
        "type": type.value,
        "title": title,
        "message": message,
        "read": False,
        "data": data or {},
        "created_at": now,
        "updated_at": now,
    }
    result = await collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return Notification(**doc)


async def mark_notification_as_read(collection: Collection, notification_id: str) -> bool:
    """
    Mark a single notification as read.
    """
    result = await collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count == 1


async def mark_all_notifications_as_read(collection: Collection, user_id: str) -> int:
    """
    Mark all notifications as read for a given user.
    """
    result = await collection.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count


async def get_user_notifications(
    collection: Collection,
    user_id: str,
    unread_only: bool = False,
    limit: int = 50
) -> List[Notification]:
    """
    Fetch notifications for a user, optionally filtering only unread ones.
    """
    query = {"user_id": user_id}
    if unread_only:
        query["read"] = False

    cursor = collection.find(query).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [Notification(**{**doc, "_id": str(doc["_id"])}) for doc in docs]
