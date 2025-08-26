from odmantic import Model, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
import logging

class Blog(Model):
    user_id: ObjectId  # Keep as ObjectId (conversion happens later)
    date: datetime = Field(default_factory=datetime.utcnow)
    title: str
    excerpt: str
    content: str
    image: Optional[str] = None  # Optional image URL

class BlogPostResponse(BaseModel):
    id: str
    user_id: str
    title: str
    excerpt: str
    content: str
    date: str
    image: Optional[str] = None

    @classmethod
    def from_document(cls, obj: Blog):
        try:
            if obj is None:
                logging.error("Blog object is None")
                return None

            if obj.date is None:
                logging.warning(f"Blog post {obj.id} has no date.")

            return cls(
                id=str(obj.id),
                user_id=str(obj.user_id),
                title=obj.title,
                excerpt=obj.excerpt,
                content=obj.content,
                date=obj.date.isoformat() if obj.date else None,
                image=obj.image
            )
        except Exception as e:
            logging.error(f"Error converting Blog to BlogPostResponse: {str(e)}", exc_info=True)
            return None #Or Raise an error.