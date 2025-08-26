# utils.py

import shutil
from uuid import uuid4
from pathlib import Path
from fastapi import HTTPException, UploadFile, status
import logging
from typing import Optional

# Define the upload folder path within the static directory
UPLOAD_FOLDER = Path("static/uploads")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def save_image(image: UploadFile) -> str:
    """Save an uploaded image to the server and return the image filename."""
    try:
        # Validate file type
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is not an image."
            )
        # Validate filename
        if not image.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file has no filename."
            )
        # Generate a unique filename
        image_filename = f"{uuid4()}{Path(image.filename).suffix}"
        image_path = UPLOAD_FOLDER / image_filename

        # Save the image
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        logger.info(f"Image saved successfully: {image_filename}")
        return str(image_filename)
    
    except Exception as e:
        logger.error(f"Failed to save image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to save image: {str(e)}"
        )

def delete_image(image_filename: str):
    """Delete an image from the server."""
    full_path = UPLOAD_FOLDER / image_filename
    logger.info(f"Attempting to delete image from path: {full_path}")
    try:
        if full_path.exists():
            full_path.unlink()
            logger.info(f"Image deleted successfully from path: {full_path}")
        else:
            logger.warning(f"Image not found at path: {full_path}")
    except Exception as e:
        logger.error(f"Error deleting image from path: {full_path}, Error: {e}")

def update_image(new_image: UploadFile, existing_image_filename: Optional[str]) -> str:
    """Atomically update an existing image with a new one."""
    try:
        new_image_filename = save_image(new_image)
        if existing_image_filename:
            delete_image(existing_image_filename)
        return new_image_filename
    except Exception as e:
        logger.error(f"Failed to update image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update image: {str(e)}"
        )
    