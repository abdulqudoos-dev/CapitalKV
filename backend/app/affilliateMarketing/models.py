# schema/affiliate_schema.py
from pydantic import BaseModel
from datetime import datetime


class AffiliateLinkRequest(BaseModel):
    affiliate_id: str
    product_id: str
    link: str
    custom_slug: str
    email: str

class salesSchema(BaseModel):
    affiliate_id: str
    product_id: str
    sale_amount: float
    commission: float
    total_commission: float
    timestamp: datetime

class clicksSchema(BaseModel):
    affiliate_id: str
    product_id: str
    timestamp: datetime
    sales_made: bool
