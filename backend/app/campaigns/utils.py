from app.database import db
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.campaigns.models import Campaign, CampaignStatus

async def get_campaign_by_id(campaign_id: str, user_id: str) -> Optional[dict]:
    try:
        campaign = await db.campaigns.find_one({
            "_id": ObjectId(campaign_id),
            "user_id": user_id
        })
        if campaign:
            campaign["id"] = str(campaign["_id"])
        return campaign
    except:
        return None

async def update_campaign_metrics(campaign_id: str, metrics: dict):
    await db.campaigns.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$set": {"metrics": metrics}}
    )

async def get_user_campaigns(
    user_id: str,
    skip: int = 0,
    limit: int = 10,
    status: Optional[CampaignStatus] = None,
    campaign_type: Optional[str] = None
) -> List[dict]:
    query = {"user_id": user_id}
    
    if status:
        query["status"] = status
    if campaign_type:
        query["campaign_type"] = campaign_type

    cursor = db.campaigns.find(query).skip(skip).limit(limit)
    campaigns = await cursor.to_list(length=limit)
    
    for campaign in campaigns:
        campaign["id"] = str(campaign["_id"])
    
    return campaigns

def calculate_campaign_metrics(campaign_id: str) -> dict:
    # Implement your metric calculation logic here
    return {
        "impressions": 0,
        "clicks": 0,
        "conversions": 0,
        "engagement_rate": 0.0,
        "roi": 0.0
    }