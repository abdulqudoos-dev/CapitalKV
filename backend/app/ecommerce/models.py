# app/ecommerce/models.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict
from bson import ObjectId # Import ObjectId for type hinting if needed for Pydantic v2+

# --- Shared Models (for both requests and internal data) ---

class PricesByIds(BaseModel):
    """
    Model for requesting details of multiple products by their Stripe IDs.
    """
    products: List[str] = Field(..., description="List of Stripe Product IDs.")

class PaymentMethod(BaseModel):
    """
    Model for setting a user's default payment method in Stripe.
    `id` should be a Stripe PaymentMethod ID (e.g., 'pm_...').
    """
    id: str = Field(..., description="Stripe PaymentMethod ID (e.g., 'pm_card_xxxx').")

class UnSubscribeRequest(BaseModel):
    """
    Model for requesting the cancellation of a Stripe subscription.
    """
    subscription_id: str = Field(..., description="The Stripe Subscription ID to cancel.")

# --- Product Management Models (for Admin API) ---

class ProductCreateUpdate(BaseModel):
    """
    Pydantic model for creating and updating product details in Stripe.
    Used by admin endpoints to manage both one-time purchase items and recurring plans.
    """
    name: str = Field(..., description="The name of the product or plan.")
    description: Optional[str] = Field(None, description="A detailed description of the product or plan.")
    price: float = Field(..., gt=0, description="The price of the product in the specified currency (e.g., dollars). Must be greater than 0.")
    currency: str = Field("usd", description="The 3-letter ISO currency code (e.g., 'usd', 'eur').")
    is_one_time_purchase: bool = Field(True, description="True for a one-time purchase product (e-commerce item), False for a recurring subscription plan.")
    interval: Optional[str] = Field(None, description="Required for recurring plans: 'day', 'week', 'month', or 'year'.")
    interval_count: Optional[int] = Field(1, ge=1, description="Number of intervals between subscription billings (e.g., 3 for 'every 3 months'). Ignored for one-time purchases.")
    image_url: Optional[str] = Field(None, description="URL to the primary image for the product.")
    features: Optional[List[str]] = Field(None, description="A list of features or benefits associated with the product/plan.")
    active: bool = Field(True, description="Whether the product and its associated price are active and visible for purchase.")
    category: Optional[str] = Field(None, description="An e-commerce category for the product (e.g., 'Electronics', 'Books').")
    in_stock: Optional[bool] = Field(True, description="Indicates if a product is currently in stock. (Requires custom inventory management logic).")
    # Early Access Fields
    early_access_date: Optional[datetime] = Field(None, description="When product becomes available to exclusive subscribers (must be before release_date).")
    release_date: Optional[datetime] = Field(None, description="When product becomes available to all users.")
    subscriber_tier_required: Optional[str] = Field(None, description="Required subscription tier for early access (e.g., 'CapitalKV Exclusive').")
    
    @field_validator('release_date')
    @classmethod
    def validate_release_date(cls, v, info):
        """Ensure release_date is after early_access_date if both are provided."""
        if v and info.data.get('early_access_date'):
            if v <= info.data['early_access_date']:
                raise ValueError('release_date must be after early_access_date')
        return v


# --- Shopping Cart & One-Time Payment Models ---

class AddToCartRequest(BaseModel):
    """
    Request model for adding a single item to the cart.
    """
    product_id: str = Field(..., description="Stripe Product ID of the item to add.")
    quantity: int = Field(1, gt=0, description="Quantity to add. Must be at least 1.")
    userId: str = Field(None, description="Optional user ID for associating the cart item with a specific user. If not provided, the item is added to a guest cart.")

class UpdateCartItemRequest(BaseModel):
    """
    Request model for updating the quantity of an item already in the cart.
    """
    quantity: int = Field(..., ge=0, description="New quantity. If 0, the item is removed.")


class CartItem(BaseModel):
    """
    Represents a single item in a user's shopping cart for a one-time purchase.
    """
    product_id: str = Field(..., description="Stripe Product ID of the item.")
    quantity: int = Field(..., gt=0, description="Quantity of the item. Must be greater than 0.")

class CreateOneTimePaymentRequest(BaseModel):
    """
    Request model for initiating a one-time payment for items in a shopping cart.
    """
    items: List[CartItem] = Field(..., min_length=1, description="List of items in the shopping cart.")
    currency: str = Field("usd", description="The currency for the payment (e.g., 'usd').")
    # Optional fields like shipping_address, coupon_code can be added here
    # shipping_address: Optional[Dict] = None
    # coupon_code: Optional[str] = None

# --- Subscription-Specific Models ---

class SubscribePlans(BaseModel):
    """
    Request model for subscribing a user to one or more recurring plans.
    """
    products: List[str] = Field(..., min_length=1, description="List of Stripe Product IDs for the subscription plans.")
    interval: str = Field(..., description="The billing interval for the subscription (e.g., 'month', 'year').")
    affiliate: Optional[str] = Field(None, description="Optional: The ID of the referring affiliate user.")



class CartItemDB(BaseModel):
    """
    Database model for an item within a cart.
    """
    product_id: str = Field(..., description="Stripe Product ID.")
    quantity: int = Field(..., description="Quantity of the item.")


class Cart(BaseModel):
    """
    Database model for a user's shopping cart.
    """
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="The ID of the user who owns the cart.")
    items: List[CartItemDB] = Field([], description="List of items in the cart.")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )


# --- Response Models ---

class ProductDetails(BaseModel):
    """
    Response model for detailed product information, typically fetched from Stripe.
    """
    id: str = Field(..., description="Stripe Product ID.")
    product_id: str = Field(None, description="Internal product ID (e.g., MongoDB ObjectId).")
    name: str = Field(..., description="Name of the product.")
    price: float = Field(..., description="Price of the product in dollars.") # Price in dollars for display
    currency: str = Field(..., description="Currency of the product (e.g., 'usd').")
    description: Optional[str] = Field(None, description="Description of the product.")
    image_url: Optional[str] = Field(None, description="URL of the product's primary image.")
    active: bool = Field(..., description="Whether the product is currently active and available.")
    features: Optional[List[str]] = Field(None, description="List of features associated with the product/plan.")
    category: Optional[str] = Field(None, description="Category of the product.")
    # For subscription plans, these fields will be populated
    interval: Optional[str] = Field(None, description="For recurring products: 'day', 'week', 'month', or 'year'.")
    interval_count: Optional[int] = Field(None, description="For recurring products: number of intervals (e.g., 3 for 'every 3 months').")
    # Early Access Fields
    early_access_date: Optional[datetime] = Field(None, description="When product becomes available to exclusive subscribers.")
    release_date: Optional[datetime] = Field(None, description="When product becomes available to all users.")
    subscriber_tier_required: Optional[str] = Field(None, description="Required subscription tier for early access.")
    # Access control info (computed based on user's subscription)
    access_status: Optional[str] = Field(None, description="User's access status: 'available', 'early_access', 'countdown', 'hidden'.")
    countdown_info: Optional[Dict] = Field(None, description="Countdown information for when product becomes available.")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class CartItemView(ProductDetails):
    """
    Response model for an item in the cart, extending product details with quantity.
    """
    quantity: int


class CartView(BaseModel):
    """
    Response model for the user's entire cart.
    """
    items: List[CartItemView]
    subtotal: float
    tax: float
    total: float


# --- Database Models (for MongoDB using Beanie/ODMantic) ---
# These models define the structure of documents stored in your MongoDB.

class OrderItem(BaseModel):
    """
    Represents a single item within an order, capturing its state at the time of purchase.
    """
    product_id: str = Field(..., description="Stripe Product ID of the item.")
    name: str = Field(..., description="Name of the product at the time of purchase.")
    price: int = Field(..., description="Price of the item in cents at the time of purchase.") # Price in cents
    quantity: int = Field(..., description="Quantity of the item purchased.")
    # Add other snapshot details if crucial (e.g., 'image_url', 'description')

class Order(BaseModel):
    """
    Database model for a user's one-time purchase order.
    """
    # Use alias="_id" and populate_by_name=True for Beanie/MongoDB ObjectId handling
    # For Beanie, you'd typically inherit from Document, but this assumes a simple Pydantic model for now.
    id: Optional[str] = Field(None, alias="_id", description="MongoDB ObjectId for the order, as a string.")
    user_id: str = Field(..., description="The ID of the user who made the purchase.")
    items: List[OrderItem] = Field(..., description="List of items included in the order.")
    total_amount: int = Field(..., description="Total amount of the order in cents.")
    currency: str = Field(..., description="Currency of the order (e.g., 'usd').")
    stripe_payment_intent_id: Optional[str] = Field(None, description="Stripe PaymentIntent ID associated with the order.")
    status: str = Field("pending", description="Current status of the order (e.g., 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded').")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the order was created.")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the order was last updated.")

    model_config = ConfigDict(
        populate_by_name=True, # Allows initialization with 'id' or '_id'
        arbitrary_types_allowed=True, # Needed if you use types like ObjectId directly in fields, otherwise not always necessary for just `str` representation
        json_encoders={ObjectId: str} # Ensure ObjectId is serialized to string
    )