import asyncio
import json
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID, uuid4
from app.notifications.notificationService import manager  
from app.notifications.models import NotificationType, Notification
from app.notifications.utils import create_notification, get_user_notifications as fetch_user_notifications, mark_all_notifications_as_read
from app.database import db
from app.users.models import User
from app.auth.utils import get_current_user
from datetime import datetime
from bson import ObjectId

# Define your notification model for in-memory store
class NotificationInMemory(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    timestamp: str
    status: str

# Admin notification request models
class AdminNotificationRequest(BaseModel):
    title: str
    message: str
    type: NotificationType
    user_ids: Optional[List[str]] = None  # If None, send to all users
    data: Optional[dict] = None

class AdminNotificationResponse(BaseModel):
    success: bool
    message: str
    sent_count: int
    notification_ids: List[str]

# In-memory store (replace with DB in production)
notifications_db = [
    NotificationInMemory(
        id=uuid4(),
        type="alert",
        title="Campaign Performance Alert",
        message='Your AI Marketing campaign "Summer Sale" has exceeded its target by 15%',
        timestamp="2 minutes ago",
        status="unread",
    ),
    NotificationInMemory(
        id=uuid4(),
        type="success",
        title="AI Analysis Complete",
        message="Customer segmentation analysis for Q2 2024 is now ready for review",
        timestamp="1 hour ago",
        status="unread",
    ),
]

notifications_router = APIRouter()

# Admin dependency
async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    """Ensure the current user has admin privileges."""
    if not current_user or not getattr(current_user, 'is_admin_user', False):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user

@notifications_router.websocket("/ws/notify")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await manager.send_personal_message(
            json.dumps({
                "title": "Connected",
                "message": "👋 Connected to notifications!",
                "type": "info"
            }),
            websocket
        )
        while True:
            await asyncio.sleep(60)  
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@notifications_router.get("/notifications", response_model=List[Notification])
async def get_user_notifications(user_id: str, current_user: User = Depends(get_current_user)):
    """Get notifications for a specific user."""
    try:
        # Verify the user is requesting their own notifications
        if str(current_user.id) != user_id and not getattr(current_user, 'is_admin_user', False):
            raise HTTPException(status_code=403, detail="Not authorized to access these notifications")
        
        notifications = await fetch_user_notifications(
            collection=db.notifications,
            user_id=user_id,
            limit=50
        )
        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")

@notifications_router.delete("/notifications/{notification_id}", status_code=204)
async def delete_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    """Delete a specific notification."""
    try:
        # First check if the notification belongs to the user
        notification = await db.notifications.find_one({"_id": ObjectId(notification_id)})
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        if str(notification["user_id"]) != str(current_user.id) and not getattr(current_user, 'is_admin_user', False):
            raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
        
        result = await db.notifications.delete_one({"_id": ObjectId(notification_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete notification: {str(e)}")

@notifications_router.post("/notifications/mark-all-read", status_code=204)
async def mark_all_as_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read for the current user."""
    try:
        result = await mark_all_notifications_as_read(
            collection=db.notifications,
            user_id=str(current_user.id)
        )
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark notifications as read: {str(e)}")

# Admin endpoints
@notifications_router.post("/admin/send", response_model=AdminNotificationResponse)
async def send_admin_notification(
    request: AdminNotificationRequest,
    admin_user: User = Depends(get_current_admin_user)
):
    """Send notifications to specific users or all users."""
    try:
        notification_ids = []
        sent_count = 0
        
        # Get target users
        if request.user_ids:
            # Send to specific users
            # Convert string IDs to ObjectId
            object_ids = [ObjectId(user_id) for user_id in request.user_ids]
            users_cursor = db.users.find({"_id": {"$in": object_ids}})
            users = await users_cursor.to_list(length=1000)
        else:
            # Send to all users
            users_cursor = db.users.find({})
            users = await users_cursor.to_list(length=1000)
        
        # Create notifications for each user
        for user in users:
            notification = await create_notification(
                collection=db.notifications,
                user_id=str(user["_id"]),
                type=request.type,
                title=request.title,
                message=request.message,
                data=request.data
            )
            notification_ids.append(notification.id)
            sent_count += 1
        
        # Broadcast to all connected clients
        await manager.broadcast(json.dumps({
            "title": request.title,
            "message": request.message,
            "type": request.type.value,
            "timestamp": datetime.utcnow().isoformat(),
            "admin_sent": True
        }))
        
        return AdminNotificationResponse(
            success=True,
            message=f"Successfully sent {sent_count} notifications",
            sent_count=sent_count,
            notification_ids=notification_ids
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notifications: {str(e)}")

@notifications_router.get("/admin/users", response_model=List[dict])
async def get_users_for_notifications(
    admin_user: User = Depends(get_current_admin_user)
):
    """Get list of users for admin notification targeting."""
    try:
        users_cursor = db.users.find({}, {
            "_id": 1,
            "email": 1,
            "first_name": 1,
            "last_name": 1,
            "username": 1,
            "is_active": 1
        })
        users = await users_cursor.to_list(length=1000)
        
        return [
            {
                "id": str(user["_id"]),
                "email": user.get("email", ""),
                "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get("username", ""),
                "username": user.get("username", ""),
                "is_active": user.get("is_active", True)
            }
            for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@notifications_router.get("/admin/notifications", response_model=List[dict])
async def get_all_notifications_admin(
    admin_user: User = Depends(get_current_admin_user),
    limit: int = 100
):
    """Get all notifications for admin review."""
    try:
        notifications_cursor = db.notifications.find({}).sort("created_at", -1).limit(limit)
        notifications = await notifications_cursor.to_list(length=limit)
        
        return [
            {
                "id": str(notif["_id"]),
                "user_id": notif["user_id"],
                "type": notif["type"],
                "title": notif["title"],
                "message": notif["message"],
                "read": notif["read"],
                "created_at": notif["created_at"].isoformat(),
                "updated_at": notif["updated_at"].isoformat()
            }
            for notif in notifications
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")
