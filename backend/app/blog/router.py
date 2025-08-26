from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Depends
from typing import Optional, List
from app.blog.models import Blog, BlogPostResponse
from app.auth.utils import get_current_user
from app.users.models import User
from app.blog.utils import save_image, delete_image, update_image, UPLOAD_FOLDER
from app.database import db
from bson import ObjectId, errors as bson_errors
import logging
from datetime import datetime
from fastapi.responses import FileResponse, Response
from pathlib import Path

blog_post_router = APIRouter()

# New POST endpoint to create a blog post
@blog_post_router.post("/posts", response_model=dict)
async def create_post(
    date: str = Form(...),
    title: str = Form(...),
    excerpt: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
):
    try:
        if not title or not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title and content are required."
            )

        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        image_filename = None
        if image:
            image_filename = save_image(image)

        new_post = Blog(
            user_id=existing_user.id,
            date=datetime.fromisoformat(date),
            title=title,
            excerpt=excerpt,
            content=content,
            image=image_filename
        )
        await db.engine.save(new_post)

        return {"status": "success", "message": "Post created successfully"}
    except Exception as e:
        logging.error(f"Error creating post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# GET endpoint to list all blog posts
@blog_post_router.get("/posts", response_model=List[BlogPostResponse])
async def list_posts():
    posts = await db.engine.find(Blog)
    return [BlogPostResponse.from_document(post) for post in posts]

# GET endpoint to retrieve a single blog post
@blog_post_router.get("/posts/{posts_id}", response_model=BlogPostResponse)
async def get_single_post(posts_id: str):
    try:
        post_id = ObjectId(posts_id)
        post = await db.engine.find_one(Blog, Blog.id == post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return BlogPostResponse.from_document(post)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

# PUT endpoint to update an existing blog post
@blog_post_router.put("/posts/{posts_id}")
async def update_post(
    posts_id: str,
    title: str = Form(...),
    excerpt: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
):
    try:
        post_id = ObjectId(posts_id)
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        existing_post = await db.engine.find_one(Blog, Blog.id == post_id)
        if not existing_post:
            raise HTTPException(status_code=404, detail="Post not found")

        if existing_post.user_id != existing_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this post"
            )

        image_filename = existing_post.image
        if image:
            image_filename = update_image(image, existing_post.image)
        
        # Update post fields
        existing_post.title = title
        existing_post.excerpt = excerpt
        existing_post.content = content
        existing_post.image = image_filename

        await db.engine.save(existing_post)
        return {"status": "success", "message": "Post updated successfully"}
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid post ID format")
    except Exception as e:
        logging.error(f"Error updating post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# DELETE endpoint to delete a blog post
@blog_post_router.delete("/posts/{posts_id}")
async def delete_post(
    posts_id: str,
    current_user: User = Depends(get_current_user),
):
    try:
        post_id = ObjectId(posts_id)
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        existing_post = await db.engine.find_one(Blog, Blog.id == post_id)
        if not existing_post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        if existing_post.user_id != existing_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this post"
            )
            
        if existing_post.image:
            delete_image(existing_post.image)

        await db.engine.delete(existing_post)
        return {"status": "success", "message": "Post deleted successfully"}
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid post ID format")
    except Exception as e:
        logging.error(f"Error deleting post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# NEW: Endpoint to serve images directly from the router
@blog_post_router.get("/images/{image_filename}")
async def get_image(image_filename: str):
    file_path = UPLOAD_FOLDER / image_filename
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Read the file content and determine the MIME type
    try:
        with open(file_path, "rb") as image_file:
            content = image_file.read()
        
        # A simple heuristic to determine the content type
        if image_filename.endswith(".jpg") or image_filename.endswith(".jpeg"):
            media_type = "image/jpeg"
        elif image_filename.endswith(".png"):
            media_type = "image/png"
        elif image_filename.endswith(".gif"):
            media_type = "image/gif"
        else:
            media_type = "application/octet-stream"

        return Response(content=content, media_type=media_type)

    except Exception as e:
        logging.error(f"Error serving image: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")