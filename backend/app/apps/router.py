from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from typing import List, Optional
from app.apps.models import App, AppCreate, AppUpdate, AppList
from app.apps.utils import app_helper, handle_mongo_error, get_app_by_id, handle_app_not_found, save_image, delete_image
from bson import ObjectId
import logging
import os
from fastapi.responses import FileResponse
from app.database import db

apps_router = APIRouter()

@apps_router.post("/apps/", response_model=App, status_code=status.HTTP_201_CREATED)
async def create_app(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    rating: float = Form(...),
    network: Optional[str] = Form(None), #Added network field
    image: UploadFile = File(...),
):
    try:
        image_filename = save_image(image)
        app_dict = {
            "name": name,
            "description": description,
            "price": price,
            "category": category,
            "rating": rating,
            "avatar": image_filename,
            "network": network, #Added network field
        }
        result = db["apps"].insert_one(app_dict)
        inserted_app = db["apps"].find_one({"_id": result.inserted_id})
        return app_helper(inserted_app)
    except Exception as e:
        logging.error(f"Error creating app: {str(e)}")
        handle_mongo_error(e)

@apps_router.get("/apps/", response_model=AppList)
async def read_apps(
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    try:
        query = {}
        if category and category != "All":
            query["category"] = category
        if search:
            query["name"] = {"$regex": search, "$options": "i"}
        apps = list(db["apps"].find(query))
        return AppList(apps=[app_helper(app) for app in apps])
    except Exception as e:
        logging.error(f"Error reading apps: {str(e)}")
        handle_mongo_error(e)

@apps_router.get("/apps/{app_id}", response_model=App)
async def read_app(app_id: str):
    try:
        app = get_app_by_id(app_id)
        if app:
            return app_helper(app)
        else:
            raise handle_app_not_found()
    except Exception as e:
        logging.error(f"Error reading app {app_id}: {str(e)}")
        handle_mongo_error(e)

@apps_router.put("/apps/{app_id}", response_model=App)
async def update_app(
    app_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    rating: Optional[float] = Form(None),
    network: Optional[str] = Form(None), #Added network field
    image: UploadFile = File(None),
):
    try:
        existing_app = get_app_by_id(app_id)
        if not existing_app:
            raise handle_app_not_found()

        update_data = {}
        if name:
            update_data["name"] = name
        if description:
            update_data["description"] = description
        if price:
            update_data["price"] = price
        if category:
            update_data["category"] = category
        if rating:
            update_data["rating"] = rating
        if network: #Added network field
            update_data["network"] = network
        if image:
            if existing_app["avatar"]:
                delete_image(existing_app["avatar"])
            update_data["avatar"] = save_image(image)

        updated_app = db["apps"].find_one_and_update(
            {"_id": ObjectId(app_id)},
            {"$set": update_data},
            return_document=True,
        )
        if updated_app:
            return app_helper(updated_app)
        else:
            raise handle_app_not_found()
    except Exception as e:
        logging.error(f"Error updating app: {str(e)}")
        handle_mongo_error(e)

@apps_router.delete("/apps/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_app(app_id: str):
    try:
        existing_app = get_app_by_id(app_id)
        if not existing_app:
            raise handle_app_not_found()

        if existing_app["avatar"]:
            delete_image(existing_app["avatar"])

        result = db["apps"].delete_one({"_id": ObjectId(app_id)})
        if result.deleted_count == 0:
            raise handle_app_not_found()
        return None
    except Exception as e:
        logging.error(f"Error deleting app: {str(e)}")
        handle_mongo_error(e)

@apps_router.put("/apps/{app_id}/rate", response_model=App)
async def rate_app(app_id: str, rating: float = Body(embed=True)):
    try:
        updated_app = db["apps"].find_one_and_update(
            {"_id": ObjectId(app_id)},
            {"$set": {"userRating": rating, "isRatingSubmitted": True}},
            return_document=True,
        )
        if updated_app:
            return app_helper(updated_app)
        else:
            raise handle_app_not_found()
    except Exception as e:
        logging.error(f"Error rating app: {str(e)}")
        handle_mongo_error(e)

@apps_router.get("/apps/images/{image_filename}")
async def get_image(image_filename: str):
    image_path = os.path.join("uploads", image_filename)
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)