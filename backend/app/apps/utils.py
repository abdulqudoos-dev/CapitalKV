from pymongo.errors import PyMongoError
from bson import ObjectId
from fastapi import HTTPException
from app.apps.models import App
import os
import uuid
import logging
from colorlog import ColoredFormatter
from pydantic_core import core_schema
from fastapi import UploadFile
from app.database import db
from app.config import settings

# Configure logging with colored formatter
logging.basicConfig(level=logging.INFO)
formatter = ColoredFormatter(
    "%(log_color)s%(levelname)s:%(name)s:%(message)s",
    datefmt=None,
    reset=True,
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'yellow',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
)
logging.getLogger().handlers[0].setFormatter(formatter)

def app_helper(app) -> App:
    return App(
        id=str(app["_id"]),
        name=app["name"],
        description=app["description"],
        price=app["price"],
        category=app["category"],
        rating=app["rating"],
        avatar=app["avatar"],
        userRating=app.get("userRating"),
        isRatingSubmitted=app.get("isRatingSubmitted"),
        network=app.get("network"), #Added network
    )

def handle_mongo_error(e: PyMongoError):
    logging.error(f"MongoDB error: {str(e)}")
    raise HTTPException(status_code=500, detail=str(e))

def handle_invalid_id():
    logging.error("Invalid app ID")
    raise HTTPException(status_code=400, detail="Invalid app ID")

def handle_app_not_found():
    logging.error("App not found")
    raise HTTPException(status_code=404, detail="App not found")

def get_app_by_id(app_id: str):
    try:
        app = db["apps"].find_one({"_id": ObjectId(app_id)})
        return app
    except Exception:
        handle_invalid_id()

def save_image(image: UploadFile):
    """Saves the uploaded image to the uploads directory."""
    try:
        if not os.path.exists("uploads"):
            os.makedirs("uploads")

        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join("uploads", unique_filename)

        with open(file_path, "wb") as buffer:
            buffer.write(image.file.read())

        logging.info(f"Image saved: {unique_filename}")
        return unique_filename
    except Exception as e:
        logging.error(f"Error saving image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")

def delete_image(filename: str):
    """Deletes the image file from the uploads directory."""
    try:
        file_path = os.path.join("uploads", filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            logging.info(f"Image deleted: {filename}")
    except Exception as e:
        logging.error(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, source: type, handler):
      return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
        )