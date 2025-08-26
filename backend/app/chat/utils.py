import logging

from bson import ObjectId
from fastapi import HTTPException
from starlette import status

from app.db.database import chat_collection
from app.models.chat import Chat

logger = logging.getLogger(__name__)


async def save_message(chat: dict):
    try:
        await chat_collection.insert_one(chat)
    except Exception as e:
        logger.error(f"error saving message {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Internal server error while saving message")


async def get_messages_by_sender_and_receiver(user_email: str, receiver_email: str, page: int, page_size: int):
    try:
        skip = (page - 1) * page_size
        query = {
            "$or": [
                {"sender_email": user_email, "receiver_email": receiver_email},
                {"sender_email": receiver_email, "receiver_email": user_email}
            ]
        }
        messages = await chat_collection.find(query).skip(skip).limit(page_size).to_list(
            length=page_size)
        if not messages:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Messages not found")
        for message in messages:
            if '_id' in message and isinstance(message['_id'], ObjectId):
                message['_id'] = str(message['_id'])
        return messages
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"error fetching message {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching messages")

async def get_messages_by_community_and_category(community: str, category: str, page: int, page_size: int):
    try:
        skip = (page - 1) * page_size
        query = {"community": community, "category": category}
        
        messages = await chat_collection.find(query).skip(skip).limit(page_size).to_list(
            length=page_size)
        if not messages:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Messages not found")
        for message in messages:
            if '_id' in message and isinstance(message['_id'], ObjectId):
                message['_id'] = str(message['_id'])
        return messages
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"error fetching message {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching messages")
