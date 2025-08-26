import logging
from datetime import datetime
from fastapi import HTTPException, status
from app.schema.affiliate_schema import salesSchema
from app.db.database import click_collection, sales_collection
from bson import ObjectId
from typing import  List

logger = logging.getLogger(__name__)

async def track_sale(sales_data: salesSchema):
    try:
        # Fetch the most recent click for the product that has not yet resulted in a sale
        click = await click_collection.find_one(
            {"product_id": sales_data.product_id, "sales_made": False},
            sort=[("timestamp", -1)]
        )
        

        if click:
            # Calculate the commission
            
            commission = sales_data.sale_amount * 0.15
            
            # Calculate total commission for the affiliate
            previous_commissions = await sales_collection.aggregate([
                {"$match": {"affiliate_id": click["affiliate_id"]}},
                {"$group": {"_id": None, "total": {"$sum": "$commission"}}}
            ]).to_list(length=1)

            total_commission = previous_commissions[0]["total"] + commission if previous_commissions else commission

            # Prepare the sales data
            data = {
                "affiliate_id": click["affiliate_id"],
                "product_id": sales_data.product_id,
                "sale_amount": sales_data.sale_amount,
                "commission": commission,
                "total_commission": total_commission,
                "timestamp": datetime.now(),
            }


            data["_id"] = str(click["_id"])

            # Insert the sale record
            await sales_collection.insert_one(data)
            
            # Mark the click as having resulted in a sale
            await click_collection.update_one(
                {"_id": ObjectId(click["_id"])},
                {"$set": {"sales_made": True}}
            )

            logger.info(f"Commission of {commission} awarded to affiliate {click['affiliate_id']}")

            return {
                "status": "success",
                "message": f"Commission of {commission} awarded to affiliate {click['affiliate_id']}",
                "data": data
            }

        else:


            logger.warning("No corresponding click found or sale already recorded.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No corresponding click found or sale already recorded."
            )

    except HTTPException as http_err:
        logger.error(f"HTTP error occurred: {http_err.detail}")
        raise http_err

    except Exception as e:

        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while tracking the sale."
        )




async def get_all_sales() -> List[salesSchema]:
    try:
        sales_cursor = sales_collection.find()
        sales_list = await sales_cursor.to_list(length=None)  

        if not sales_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No sales found"
            )

        return [salesSchema(**sale) for sale in sales_list]

    except Exception as e:
        logger.error(f"An error occurred while fetching sales: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching sales"
        )