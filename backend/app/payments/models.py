from datetime import datetime
from pydantic import BaseModel,ConfigDict
from typing import Optional, List

class PricesByIds(BaseModel):
    products: List[str]
    
class SubscribePlans(BaseModel):
    products: List[str]
    interval: str
    affiliate:Optional[str] = None
    
    
class PaymentMethod(BaseModel):
    id: str
    


class CreatePaymentIntentRequest(BaseModel):
    amount: int  # Amount in cents (e.g., 5000 for $50.00)
    currency: str  # Currency code (e.g., "usd")


class UnSubscribeRequest(BaseModel):
    subscription_id: str  # Amount in cents (e.g., 5000 for $50.00)
