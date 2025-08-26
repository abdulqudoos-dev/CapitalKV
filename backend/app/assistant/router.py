from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

# The router instance is now named 'assistant_router' to match the main.py file
assistant_router = APIRouter()

# Define the data models for the request and response
class VoiceQuery(BaseModel):
    user_query: str

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

# API endpoint to handle assistant queries
# We have removed the "/assistant" from the path here
@assistant_router.post("/voice")
async def assistant_voice(query: VoiceQuery) -> Dict[str, Any]:
    """
    Handles typed and voice input, returning a structured JSON response
    with an action for the frontend.
    """
    # Import inside the function to break the circular dependency
    from .models import process_ai_query

    # Process the user's query and get a structured response
    response = process_ai_query(query.user_query)

    # Return the AI's response to the frontend
    return response

# API endpoint to add an item to the cart
# We have removed the "/assistant" from the path here as well
@assistant_router.post("/cart/add")
async def add_to_cart_endpoint(item: CartItem):
    """
    Adds a specified product to a user's cart. This is a separate
    endpoint from the main assistant query.
    """
    from .models import add_to_cart

    # In a real app, you would get the user ID from the authentication token
    user_id = "temp_user" # Using a temporary user ID for this example
    success = add_to_cart(user_id, item.product_id, item.quantity)
    
    if success:
        return {"status": "success", "message": "Product added to cart!"}
    else:
        return {"status": "error", "message": "Failed to add product to cart."}
