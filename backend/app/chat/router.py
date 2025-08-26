import base64
import os
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from app.database import db
from app.auth.utils import get_current_user
from app.chat.models import Group,GroupMember,Message
from app.file_upload import save_uploaded_file, ALLOWED_IMAGES
from typing import Optional, List
from bson import ObjectId

chat_router = APIRouter()

def transform_group(group):
    return {
        "id": str(group.id),
        "name": group.name,
        "created_by": str(group.created_by) if group.created_by else None,
        "members": [str(member) for member in group.members],
        "group_avatar_url": group.group_avatar_url,
        "created_at": group.created_at.isoformat()
    }

ADMIN_GROUPS = ["announcements", "insider", "market", "networking"]

@chat_router.get("/group-avatars/{group_id}")
async def get_group_avatars(group_id: str):
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    avatars = []

    for user_id in group.get("members", []):
        user = await db.users.find_one({"_id": user_id}, {"image_path": 1})
        if user and user.get("image_path") and os.path.exists(user["image_path"]):
            with open(user["image_path"], "rb") as img_file:
                encoded_string = base64.b64encode(img_file.read()).decode("utf-8")
            avatars.append({
                "user_id": str(user_id),
                "image_base64": f"data:image/jpeg;base64,{encoded_string}"
            })
        else:
            avatars.append({
                "user_id": str(user_id),
                "image_base64": None 
            })

    return JSONResponse(content={"avatars": avatars})

@chat_router.post("/groups/{group_id}/upload-avatar")
async def upload_group_avatar(
    group_id: str,
    avatar: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Upload a profile picture for a group."""
    # Check if the group exists and user has permission
    group = await db.engine.find_one(Group, Group.id == ObjectId(group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Only group creator can upload group avatar
    if group.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only group creator can upload group avatar")
    
    # Validate file type
    if avatar.content_type not in ALLOWED_IMAGES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {avatar.content_type}")
    
    # Validate file size (e.g., max 5MB for base64 storage)
    max_size = 5 * 1024 * 1024  # 5MB
    avatar_content = await avatar.read()
    if len(avatar_content) > max_size:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
    
    # Convert to base64 and store directly in MongoDB
    import base64
    avatar_base64 = base64.b64encode(avatar_content).decode('utf-8')
    avatar_data_url = f"data:{avatar.content_type};base64,{avatar_base64}"
    
    # Update group with avatar data
    group.group_avatar_url = avatar_data_url
    await db.engine.save(group)
    
    return {"status": "success", "message": "Group avatar uploaded successfully", "avatar_url": avatar_data_url}

@chat_router.get("/groups/{group_id}/avatar")
async def get_group_avatar(group_id: str):
    """Get the profile picture for a group."""
    group = await db.engine.find_one(Group, Group.id == ObjectId(group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if not group.group_avatar_url:
        raise HTTPException(status_code=404, detail="Group avatar not found")
    
    # Return the base64 data URL directly
    return {"avatar_url": group.group_avatar_url}

@chat_router.post("/groups")
async def create_group(data:Group, current_user = Depends(get_current_user)):
    """Create a new group."""
    print(data.name)
    print(current_user.id)
    # Create the new group
    new_group = Group(name=data.name, members=[current_user.id], created_by=ObjectId(current_user.id))
    await db.engine.save(new_group)

    return {"status": "success", "message": "Group created successfully"}

@chat_router.post("/groups/{group_id}/add_member/")
async def add_member_to_group(
    data:GroupMember, current_user = Depends(get_current_user)
):
    """Add a member to a group."""
    # Check if the group exists
    group = await db.engine.find_one(Group, Group.id == ObjectId(data.group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if the user is already a member
    if data.user_id in group.members:
        raise HTTPException(status_code=400, detail="User is already a member of the group.")

    # Add the user to the group
    group.members.append(ObjectId(data.user_id))
    await db.engine.save(group)

    return {
        "status": "success",
        "message": "User added to the group successfully",
    }


@chat_router.get("/groups/mine/")
async def get_user_groups(current_user=Depends(get_current_user)):
    """
    Fetch all groups where the current user is a member or the creator.
    """
    try:
        # Query for groups where the user is a member or the creator
        groups = await db.engine.find(
            Group,
            {
                "$or": [
                    {"members": ObjectId(current_user.id)}
                ]
            }
        )

        if not groups:
            return {"status": "success", "message": "No groups found", "groups": []}

        # Transform groups to make them JSON serializable
        transformed_groups = [transform_group(group) for group in groups]

        return {"status": "success", "groups": transformed_groups}

    except Exception as e:
        print(f"Error fetching user groups: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An error occurred while fetching groups."
        )
# 1. Create a Message
@chat_router.post("/messages/")
async def create_message(message: Message, current_user: dict = Depends(get_current_user)):
    """
    Create a message in the appropriate context (admin group, user group, or direct message).
    """
    # Admin group message
    if message.group_name:
        message.is_admin_message = True

    # User group message
    elif message.group_id:
        group = await db.engine.find_one(Group, Group.id == ObjectId(message.group_id))
        if not group:
            raise HTTPException(status_code=404, detail="Group not found.")
        if current_user.id not in group.members and group.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You are not a member of this group.")
        
    elif message.receipt_id:
        message.receipt_id = message.receipt_id

    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide either group_name, group_id, or receipt_id.",
        )

    # Save the message
    message_data = Message(
        message=message.message,
        receipt_id=ObjectId(message.receipt_id),
        group_id=ObjectId(message.group_id),
        is_admin_message=message.is_admin_message,
        group_name=message.group_name,
        user_id=ObjectId(current_user.id),

    )
    await db.engine.save(message_data)

    return {"status": "success", "message": "Message created successfully", "data": message_data}


# 2. Fetch Messages
@chat_router.get("/messages/")
async def fetch_messages(
    group_name: Optional[str] = None,
    group_id: Optional[str] = None,
    receipt_id: Optional[str] = None,
    current_user: str = Depends(get_current_user),
):
    
  
    """
    Fetch messages by group_name, group_id, or receipt_id.
    """
    query = {}

    # Admin group messages
    if group_name:
        query["group_name"] = group_name

    # User group messages
    elif group_id:
        group = await db.engine.find_one(Group, Group.id == ObjectId(group_id))
        if not group:
            raise HTTPException(status_code=404, detail="Group not found.")
        query["$or"] = [
            {"group_id": ObjectId(group_id) },
        ]

    # Direct messages
    elif receipt_id:
        query["$or"] = [
            {"user_id": ObjectId(current_user.id), "receipt_id":ObjectId(receipt_id) },
            {"user_id": ObjectId(receipt_id), "receipt_id": ObjectId(current_user.id)},
        ]

    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide either group_name, group_id, or receipt_id.",
        )

    messages = await db.engine.find(Message, query)

    # Transform messages for JSON compatibility
    transformed_messages = [
        {
            "id": str(msg.id),
            "group_id": str(msg.group_id) if msg.group_id else None,
            "user_id": str(msg.user_id) if msg.user_id else None,
            "receipt_id": str(msg.receipt_id) if msg.receipt_id else None,
            "message": msg.message,
            "is_admin_message": msg.is_admin_message,
            "group_name": msg.group_name,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]

    return {"status": "success", "messages": transformed_messages}



@chat_router.post("/groups/{group_id}/remove_member/")
async def remove_member_from_group(
    data: GroupMember, current_user: dict = Depends(get_current_user)
):
    """
    Remove a member from a group.
    """
    # Fetch the group
    group = await db.engine.find_one(Group, Group.id == ObjectId(data.group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    # Check if the user is a member of the group
    if ObjectId(data.user_id) not in group.members:
        raise HTTPException(status_code=400, detail="User is not a member of the group.")

    # Remove the user from the group
    group.members.remove(ObjectId(data.user_id))

    # If the user being removed is the group creator, assign a new creator
    if ObjectId(data.user_id) == group.created_by:
        if group.members:  # Check if there are other members
            group.created_by = group.members[0]  # Assign the first member as the new creator
        else:
            group.created_by = None  # If no members remain, no creator exists

    # Save the updated group
    await db.engine.save(group)

    return {
        "status": "success",
        "message": f"User {data.user_id} has been removed from the group.",
    }


@chat_router.post("/groups/{group_id}/delete_group/")
async def delete_group(
    data:GroupMember, current_user: dict = Depends(get_current_user)
):
    """
    Remove a member from a group.
    """
    # Fetch the group
    group = await db.engine.find_one(Group, Group.id == ObjectId(data.group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    # Only the creator of the group can delete groups
    if group.created_by != current_user.id:
        raise HTTPException(
            status_code=403, detail="Only the group creator can delete group."
        )

    await db.engine.delete(group)

    return {
        "status": "success",
        "message": f"User {data.user_id} has been removed from the group.",
    }

