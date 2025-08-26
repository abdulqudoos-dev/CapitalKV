import logging
from app.schema.affiliate_schema import clicksSchema , salesSchema
from dotenv import load_dotenv
from fastapi import HTTPException
from starlette import status
from starlette.config import Config
from datetime import datetime , timezone
from app.db.database import  affiliate_links_collection
from app.schema.affiliate_schema import AffiliateLinkRequest
import logging
from fastapi import  HTTPException

from datetime import datetime
from app.schema.affiliate_schema import AffiliateLinkRequest
from app.db.database import user_collection, products_request
from uuid import uuid4
from bson import ObjectId
from starlette import status

load_dotenv()

logger = logging.getLogger(__name__)

async def create_affiliate_link(affiliate_data: AffiliateLinkRequest):
    try:
        product_id = affiliate_data.product_id
        affiliate_id = str(uuid4())  

        # Standardize base link generation
        base_link = affiliate_data.link.rstrip('/')  # Remove trailing slash if exists
        
        if affiliate_data.custom_slug:
            affiliate_link = f"{base_link}/{affiliate_data.custom_slug}?affiliate_id={affiliate_id}"
        else:
            affiliate_link = f"{base_link}?affiliate_id={affiliate_id}"
        affiliate_link_data = AffiliateLinkRequest(
            affiliate_id=affiliate_id,
            product_id=product_id,
            link=affiliate_link,
            custom_slug=affiliate_data.custom_slug,
            email=affiliate_data.email
        )
        await affiliate_links_collection.insert_one(affiliate_link_data.model_dump())
        return affiliate_link_data
    except Exception as e:
        logger.error("Failed to create affiliate link: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create affiliate link")



async def edit_affiliate_link(affiliate_id: str, updated_data: AffiliateLinkRequest):
    try:
        existing_link = await affiliate_links_collection.find_one({"affiliate_id": affiliate_id})
        
        if not existing_link:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate link not found")
        
        update_data = {}
        if updated_data.custom_slug:
            update_data["custom_slug"] = updated_data.custom_slug
        if updated_data.email:
            update_data["email"] = updated_data.email

        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")
        
        await affiliate_links_collection.update_one(
            {"affiliate_id": affiliate_id},
            {"$set": update_data}
        )

        updated_link = await affiliate_links_collection.find_one({"affiliate_id": affiliate_id})
        return {
            "status": "success",
            "message": "Affiliate link updated successfully",
            "data": updated_link
        }

    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        logger.error(f"Failed to update affiliate link: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update affiliate link")





async def delete_affiliate_link(affiliate_id: str):
    try:
        existing_link = await affiliate_links_collection.find_one({"affiliate_id": affiliate_id})
        logger.info(existing_link)
        if not existing_link:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate link not found")

        await affiliate_links_collection.delete_one({"affiliate_id": affiliate_id})

        return {
            "status": "success",
            "message": f"Affiliate link with ID {affiliate_id} deleted successfully"
        }

    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        logger.error(f"Failed to delete affiliate link: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete affiliate link")



def serialize_mongo_document(document):
    """Convert ObjectId to string in the MongoDB document."""
    if isinstance(document, list):
        return [serialize_mongo_document(item) for item in document]
    if isinstance(document, dict):
        return {key: (str(value) if isinstance(value, ObjectId) else value) for key, value in document.items()}
    return document



async def get_all():
    try:
        result = await products_request.find().to_list(length=None)
       
        serialized_result = serialize_mongo_document(result)

        if not serialized_result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No products found")
        return serialized_result
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        logger.error("Failed to retrieve request: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get data")
    


