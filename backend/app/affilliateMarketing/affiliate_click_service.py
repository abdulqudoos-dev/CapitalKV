import logging
from datetime import datetime
from fastapi import HTTPException, status
from app.schema.affiliate_schema import clicksSchema
from app.db.database import click_collection

logger = logging.getLogger(__name__)

async def track_click(clicks_data: clicksSchema):
    try:
        # Prepare the data to be inserted
        print("yessssssssssssssssssssss")
        
        data = {
            "affiliate_id": clicks_data.affiliate_id,
            "product_id": clicks_data.product_id,
            "timestamp": datetime.now(),
            "sales_made": False  # Indicates no sale has been made yet
        }

        # Insert the click data into the collection
        result= await click_collection.insert_one(data)
        data["_id"] = str(result.inserted_id)
        logger.info(f"Click tracked for affiliate {clicks_data.affiliate_id} and product {clicks_data.product_id}")

        # Return a success response
        return {
            "status": "success",
            "message": f"Click tracked for affiliate {clicks_data.affiliate_id} and product {clicks_data.product_id}",
            "data": data
        }

    except Exception as e:
        # Log any other exceptions and raise a 500 error
        logger.error(f"An error occurred while tracking the click: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while tracking the click."
        )
