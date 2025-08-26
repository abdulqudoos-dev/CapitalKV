from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.auth.utils import get_current_active_user
from app.auth.models import User
from app.campaigns.models import (
    Campaign, CampaignCreate, CampaignUpdate, 
    CampaignStatus, CampaignMetrics
)
from app.campaigns.utils import (
    get_campaign_by_id, update_campaign_metrics,
    get_user_campaigns, calculate_campaign_metrics
)
from app.database import db

router = APIRouter()

@router.post("/", response_model=Campaign)
async def create_campaign(
    campaign: CampaignCreate,
    current_user: User = Depends(get_current_active_user)
):
    campaign_dict = campaign.dict()
    campaign_dict.update({
        "user_id": current_user.username,
        "status": CampaignStatus.DRAFT,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "metrics": {}
    })
    
    result = await db.campaigns.insert_one(campaign_dict)
    campaign_dict["id"] = str(result.inserted_id)
    return campaign_dict

@router.get("/", response_model=List[Campaign])
async def get_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[CampaignStatus] = None,
    campaign_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    campaigns = await get_user_campaigns(
        current_user.username,
        skip,
        limit,
        status,
        campaign_type
    )
    return campaigns

@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_active_user)
):
    campaign = await get_campaign_by_id(campaign_id, current_user.username)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.put("/{campaign_id}", response_model=Campaign)
async def update_campaign(
    campaign_id: str,
    campaign_update: CampaignUpdate,
    current_user: User = Depends(get_current_active_user)
):
    campaign = await get_campaign_by_id(campaign_id, current_user.username)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    update_data = campaign_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()

    await db.campaigns.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$set": update_data}
    )

    return await get_campaign_by_id(campaign_id, current_user.username)

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str, current_user: User = Depends(get_current_active_user)
):
    campaign = await get_campaign_by_id(campaign_id, current_user.username)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    await db.campaigns.delete_one({"_id": ObjectId(campaign_id)})
    return {"message": "Campaign deleted successfully"}

@router.post("/{campaign_id}/metrics", response_model=CampaignMetrics)
async def update_campaign_metrics(
    campaign_id: str,
    metrics: CampaignMetrics,
    current_user: User = Depends(get_current_active_user)
):
    campaign = await get_campaign_by_id(campaign_id, current_user.username)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    await db.campaigns.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$set": {"metrics": metrics.dict()}}
    )
    return metrics

@router.get("/{campaign_id}/metrics", response_model=CampaignMetrics)
async def get_campaign_metrics(
    campaign_id: str,
    current_user: User = Depends(get_current_active_user)
):
    campaign = await get_campaign_by_id(campaign_id, current_user.username)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    metrics = calculate_campaign_metrics(campaign_id)
    return metrics