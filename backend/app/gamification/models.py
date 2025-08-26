from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Literal
from bson import ObjectId

# --- Loyalty Centre Models ---

class LoyaltyCoupon(BaseModel):
    """
    Represents a coupon unlocked at a specific loyalty level.
    """
    id: int = Field(..., description="Unique coupon ID.")
    name: str = Field(..., description="Description or benefit of the coupon.")
    unlocked: bool = Field(False, description="True if the user has unlocked the coupon.")

LoyaltyLevel = Literal[1, 2, 3]

class LoyaltyStatus(BaseModel):
    """
    Tracks user's loyalty stamps, level, and unlocked coupons.
    """
    id: Optional[str] = Field(None, alias="_id", description="MongoDB ObjectId or user ID.")
    user_id: str = Field(..., description="User ID.")
    stamps_earned: int = Field(0, ge=0, le=45, description="Total stamps earned (max 45).")
    level: LoyaltyLevel = Field(1, description="Loyalty level: 1 (0–15 stamps), 2 (16–30), 3 (31–45).")
    coupons: List[LoyaltyCoupon] = Field(default_factory=list, description="Coupons unlocked at current level.")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last updated timestamp.")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class LoyaltyProgressView(BaseModel):
    """
    Response model for UI rendering of the loyalty program progress.
    """
    user_id: str = Field(..., description="User ID.")
    stamps_earned: int = Field(..., description="Current number of stamps earned.")
    level: LoyaltyLevel = Field(..., description="Current loyalty level.")
    total_stamps: int = Field(45, description="Total possible stamps.")
    progress_percent: float = Field(..., description="Percent completion toward max stamps.")
    coupons: List[LoyaltyCoupon] = Field(..., description="List of unlocked coupons.")
