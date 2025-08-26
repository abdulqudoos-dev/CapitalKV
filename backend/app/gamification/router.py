from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId

# --- Models (you should ideally import these from your models module) ---

class LoyaltyCoupon(BaseModel):
    id: int = Field(..., description="Unique coupon ID.")
    name: str = Field(..., description="Coupon benefit description.")
    unlocked: bool = Field(False, description="True if coupon has been unlocked.")

class LoyaltyStatus(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str = Field(..., description="User ID.")
    stamps_earned: int = Field(0, ge=0, le=45, description="Max 45 stamps.")
    level: int = Field(1, ge=1, le=3, description="Level 1–3 based on stamps.")
    coupons: List[LoyaltyCoupon] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class LoyaltyProgressView(BaseModel):
    user_id: str
    stamps_earned: int
    level: int
    total_stamps: int = 45
    progress_percent: float = Field(..., description="Percent completion toward max stamps.")
    coupons: List[LoyaltyCoupon]

# --- Create the router ---
gamification_router = APIRouter()

# --- Fake DB for demo purposes ---
fake_loyalty_db = {
    "user123": LoyaltyStatus(
        user_id="user123",
        stamps_earned=20,
        level=2,
        coupons=[
            LoyaltyCoupon(id=1, name="10% OFF", unlocked=True),
            LoyaltyCoupon(id=2, name="Free Shipping", unlocked=False),
        ]
    ),
    "user456": LoyaltyStatus(
        user_id="user456",
        stamps_earned=5,
        level=1,
        coupons=[]
    )
}

# --- Routes ---

@gamification_router.get("/status/{user_id}", response_model=LoyaltyStatus)
async def get_loyalty_status(user_id: str):
    status = fake_loyalty_db.get(user_id)
    if not status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return status

@gamification_router.get("/progress/{user_id}", response_model=LoyaltyProgressView)
async def get_loyalty_progress(user_id: str):
    status = fake_loyalty_db.get(user_id)
    if not status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    progress_percent = (status.stamps_earned / 45) * 100

    return LoyaltyProgressView(
        user_id=status.user_id,
        stamps_earned=status.stamps_earned,
        level=status.level,
        progress_percent=progress_percent,
        coupons=status.coupons
    )

@gamification_router.post("/stamp/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_stamp(user_id: str):
    status = fake_loyalty_db.get(user_id)
    if not status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if status.stamps_earned < 45:
        status.stamps_earned += 1

        # Update level based on stamps earned
        if status.stamps_earned >= 30:
            status.level = 3
        elif status.stamps_earned >= 15:
            status.level = 2
        else:
            status.level = 1

        status.last_updated = datetime.utcnow()
    return None
