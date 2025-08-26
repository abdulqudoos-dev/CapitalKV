from fastapi import UploadFile, HTTPException
from pathlib import Path
import shutil

# Directory to save the uploaded files
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Supported content for file upload
ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/jpg","image/HEVC","image/heic", "image/heif"]
ALLOWED_VIDEOS = ["video/mp4", "video/mpeg", "video/quicktime","video/mov"]

async def save_uploaded_file(file: UploadFile, allowed_type: list) -> str:
    """
    Save an uploaded file to the specified directory.

    Args:
    - file: UploadFile object
    - allowed_types: List of allowed content types
    
    Returns:
    - The relative file path of the saved file
    
    Raises:
    - HTTPException if the file type is not allowed
    """
    # Check if the file content type is allowed
    if file.content_type not in allowed_type:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

    # Create a unique file path
    file_location = UPLOAD_DIR / file.filename
    
    # Save the file to the specified location
    with file_location.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the relative file path to the file (you can modify this to return an absolute path if needed)
    return str(file_location)
