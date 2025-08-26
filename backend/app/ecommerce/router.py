# app/ecommerce/router.py

from urllib.parse import urlparse
from fastapi.responses import FileResponse
import stripe
from stripe.error import StripeError
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from typing import Optional, List, Dict
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import os # Import os module
import uuid # Import uuid for unique filenames
from pathlib import Path # For path manipulation
from app.notifications.notificationService import manager  

# Ensure these imports match your actual file structure
from app.users.utils import get_current_user, update_user_profile
from app.ecommerce.models import (
    PricesByIds,
    SubscribePlans,
    PaymentMethod,
    UnSubscribeRequest,
    CartItem,
    CreateOneTimePaymentRequest,
    Order,
    OrderItem,
    ProductDetails,
    ProductCreateUpdate,
    Cart,
    CartItemDB,
    CartView,
    CartItemView,
    AddToCartRequest,
    UpdateCartItemRequest
)
from app.ecommerce.access_control import (
    calculate_product_access_info,
    filter_products_by_access,
    user_has_early_access
)
from app.users.models import AffliliateTransactions, User
from app.payments.utils import generate_customer_id
from app.database import db
from app.config import settings

# Initialize Stripe with your API key
stripe.api_key = settings.stripe_api_key
stripe_webhook_secret = settings.stripe_webhook_secret

# Initialize the FastAPI router for e-commerce endpoints
ecommerce_router = APIRouter()

# --- Admin Utility ---
async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    """
    Dependency to ensure the current user has admin privileges.
    """
    # Assuming 'role' is a field in your User model
    if not current_user or getattr(current_user, 'role', 'user') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted: Admin access required."
        )
    return current_user


@ecommerce_router.get("/admin/product-image/{id}", response_class=FileResponse)
async def get_product_image(id: str):
    product = await db.products.find_one({"_id": ObjectId(id)})

    if not product or not product.get("image_url"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    # Relative to 'backend/static/uploads'
    image_path = Path(__file__).resolve().parent.parent.parent / product["image_url"]
    print("Serving image from:", image_path)

    if not image_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image file not found on server.")

    return FileResponse(str(image_path), media_type="image/jpeg")

# Define the directory for static files (where images will be stored)
# IMPORTANT: Make sure this path is correct relative to where your FastAPI app runs
STATIC_DIR = Path("static")
UPLOADS_DIR = STATIC_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True) # Create directories if they don't exist

# --- Admin Product Management Endpoints ---

def is_valid_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return all([parsed.scheme in ["http", "https"], parsed.netloc])
    except Exception:
        return False

@ecommerce_router.post("/admin/products", response_model=ProductDetails, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreateUpdate,
    # admin_user: User = Depends(get_current_admin_user)  # Uncomment when admin auth is ready
):
    """
    Admin endpoint to create a new product (one-time purchase or subscription plan) in Stripe.
    """

    # Prevent duplicate product name
    existing_product = await db.products.find_one({"name": product_data.name})
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A product with the name '{product_data.name}' already exists."
        )

    try:
        # Determine product image (Stripe requires a valid URL if provided)
        image_urls = [f"https://backend.capitalkv.com{product_data.image_url}"] if product_data.image_url else []

        # Create Stripe Product
        stripe_product = stripe.Product.create(
            name=product_data.name,
            description=product_data.description,
            images=image_urls,
            active=product_data.active,
        )

        interval = None
        interval_count = None

        # Create Stripe Price with unique lookup key
        import uuid
        unique_id = str(uuid.uuid4())[:8]  # Use first 8 characters of UUID
        
        if product_data.is_one_time_purchase:
            stripe_price = stripe.Price.create(
                unit_amount=int(product_data.price * 100),
                currency=product_data.currency,
                product=stripe_product.id,
                billing_scheme="per_unit",
                lookup_key=f"{product_data.name.lower().replace(' ', '-')}-one-time-{unique_id}",
            )
        else:
            if not product_data.interval or not product_data.interval_count:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Interval and interval_count are required for subscription products."
                )

            stripe_price = stripe.Price.create(
                unit_amount=int(product_data.price * 100),
                currency=product_data.currency,
                product=stripe_product.id,
                recurring={
                    "interval": product_data.interval,
                    "interval_count": product_data.interval_count
                },
                lookup_key=f"{product_data.name.lower().replace(' ', '-')}-{product_data.interval}-{product_data.interval_count}-{unique_id}",
            )
            interval = product_data.interval
            interval_count = product_data.interval_count

        # Store in MongoDB
        product_doc = {
            "_id": ObjectId(),
            "stripe_product_id": stripe_product.id,
            "stripe_price_id": stripe_price.id,
            "name": product_data.name,
            "description": product_data.description,
            "price": product_data.price,
            "currency": product_data.currency,
            "image_url": product_data.image_url,
            "active": product_data.active,
            "features": product_data.features,
            "category": product_data.category,
            "is_one_time_purchase": product_data.is_one_time_purchase,
            "interval": interval,
            "interval_count": interval_count,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "in_stock": product_data.in_stock,
            # Early Access Fields
            "early_access_date": product_data.early_access_date,
            "release_date": product_data.release_date,
            "subscriber_tier_required": product_data.subscriber_tier_required,
        }

        await db.products.insert_one(product_doc)

        await manager.broadcast(f"New product added: {product_data.name}")

        # Prepare response
        return ProductDetails(
            id=stripe_product.id,
            name=stripe_product.name,
            price=product_data.price,
            currency=product_data.currency,
            description=stripe_product.description,
            image_url=stripe_product.images[0] if stripe_product.images else None,
            active=stripe_product.active,
            features=product_data.features,
            category=product_data.category,
            interval=interval,
            interval_count=interval_count,
        )

    except StripeError as e:
        if "already uses that lookup key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A price already uses that lookup key."
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    except Exception as e:
        print(f"Error creating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {e}"
        )

@ecommerce_router.put("/admin/products/{product_id}", response_model=ProductDetails)
async def update_product(
    product_id: str,
    product_data: ProductCreateUpdate,
    # admin_user: User = Depends(get_current_admin_user) # Uncomment when admin auth is ready
):
    """
    Admin endpoint to update an existing product in Stripe and MongoDB.
    """
    existing_product = await db.products.find_one({"stripe_product_id": product_id})
    if not existing_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    try:
        # Prepare data for Stripe product update
        stripe_update_data = {
            "name": product_data.name,
            "description": product_data.description,
            "active": product_data.active,
        }
        # Only update the image if a new one is provided
        if product_data.image_url:
            stripe_update_data['images'] = [product_data.image_url]

        # Update Stripe Product
        stripe.Product.modify(product_id, **stripe_update_data)

        # Prepare data for MongoDB update
        update_fields = {
            "name": product_data.name,
            "description": product_data.description,
            "price": product_data.price,
            "currency": product_data.currency,
            "active": product_data.active,
            "features": product_data.features,
            "category": product_data.category,
            "is_one_time_purchase": product_data.is_one_time_purchase,
            "interval": product_data.interval,
            "interval_count": product_data.interval_count,
            "updated_at": datetime.utcnow(),
            "in_stock": product_data.in_stock,
            # Early Access Fields
            "early_access_date": product_data.early_access_date,
            "release_date": product_data.release_date,
            "subscriber_tier_required": product_data.subscriber_tier_required,
        }
        # Only update image_url in DB if a new one was provided
        if product_data.image_url:
            update_fields['image_url'] = product_data.image_url

        await db.products.update_one(
            {"stripe_product_id": product_id},
            {"$set": update_fields}
        )

        updated_product_doc = await db.products.find_one({"stripe_product_id": product_id})

        return ProductDetails(
            id=updated_product_doc["stripe_product_id"],
            name=updated_product_doc["name"],
            price=updated_product_doc["price"],
            currency=updated_product_doc["currency"],
            description=updated_product_doc.get("description"),
            image_url=updated_product_doc.get("image_url"),
            active=updated_product_doc["active"],
            features=updated_product_doc.get("features"),
            category=updated_product_doc.get("category"),
            interval=updated_product_doc.get("interval"),
            interval_count=updated_product_doc.get("interval_count")
        )
    except StripeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"Error updating product: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {e}")

@ecommerce_router.delete("/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    # admin_user: User = Depends(get_current_admin_user) # Uncomment when admin auth is ready
):
    """
    Admin endpoint to "delete" (archive/deactivate) a product in Stripe and MongoDB.
    Instead of hard deleting, we set `active` to False.
    Also removes the product from all user carts.
    """
    existing_product = await db.products.find_one({"stripe_product_id": product_id})
    if not existing_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    try:
        # Deactivate the product in Stripe
        stripe.Product.modify(product_id, active=False)

        # Deactivate the product in MongoDB
        await db.products.update_one(
            {"stripe_product_id": product_id},
            {"$set": {"active": False, "updated_at": datetime.utcnow()}}
        )
        
        # Remove the product from all user carts
        await db.carts.update_many(
            {},  # Update all carts
            {"$pull": {"items": {"product_id": product_id}}, "$set": {"updated_at": datetime.utcnow()}}
        )
        
        return {"message": "Product deactivated successfully and removed from all carts."}
    except StripeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"Error deactivating product: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {e}")




@ecommerce_router.post("/cart/sync-guest-cart")
async def sync_guest_cart(guest_items: List[CartItem], current_user: User = Depends(get_current_user)):
    """Syncs guest cart items to the user's authenticated cart."""
    try:
        cart = await db.carts.find_one({"user_id": str(current_user.id)})
        
        if not cart:
            # Create new cart with guest items
            new_cart = Cart(
                user_id=str(current_user.id), 
                items=[CartItemDB(product_id=item.product_id, quantity=item.quantity) for item in guest_items]
            )
            await db.carts.insert_one(new_cart.model_dump(by_alias=True))
        else:
            # Merge guest items with existing cart
            for guest_item in guest_items:
                existing_item = next(
                    (item for item in cart['items'] if item['product_id'] == guest_item.product_id), 
                    None
                )
                
                if existing_item:
                    # Update quantity
                    await db.carts.update_one(
                        {"user_id": str(current_user.id), "items.product_id": guest_item.product_id},
                        {"$inc": {"items.$.quantity": guest_item.quantity}, "$set": {"updated_at": datetime.utcnow()}}
                    )
                else:
                    # Add new item
                    await db.carts.update_one(
                        {"user_id": str(current_user.id)},
                        {"$push": {"items": CartItemDB(product_id=guest_item.product_id, quantity=guest_item.quantity).model_dump()}, "$set": {"updated_at": datetime.utcnow()}}
                    )
        
        return await get_cart(current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync guest cart: {str(e)}")


@ecommerce_router.get("/cart", response_model=CartView)
async def get_cart(current_user: User = Depends(get_current_user)):
    """Retrieves the current user's shopping cart."""
    cart_doc = await db.carts.find_one({"user_id": str(current_user.id)})
    if not cart_doc:
        return CartView(items=[], subtotal=0, tax=0, total=0)

    cart_doc = fix_object_ids(cart_doc)  # <-- Fix ObjectId fields
    cart = Cart.model_validate(cart_doc)
    cart_items_view = []
    subtotal = 0

    for item in cart.items:
        product_details = await _get_product_details(item.product_id)
        if product_details:
            item_view = CartItemView(**product_details.model_dump(), quantity=item.quantity)
            cart_items_view.append(item_view)
            subtotal += item_view.price * item.quantity

    tax = 0
    total = subtotal + tax

    return CartView(items=cart_items_view, subtotal=subtotal, tax=tax, total=total)

def fix_object_ids(doc):
    """
    Recursively convert all ObjectId fields in a dict to strings.
    """
    if isinstance(doc, list):
        return [fix_object_ids(i) for i in doc]
    if isinstance(doc, dict):
        return {k: (str(v) if isinstance(v, ObjectId) else fix_object_ids(v)) for k, v in doc.items()}
    return doc


@ecommerce_router.post("/cart/items", response_model=CartView)
async def add_to_cart(request: AddToCartRequest, current_user: User = Depends(get_current_user)):
    """
    Adds an item to the cart or updates its quantity if it already exists.
    """
    # Find the user's cart
    cart = await db.carts.find_one({"user_id": str(current_user.id)})

    # Get product details (by stripe_product_id)
    product_details = await _get_product_details(request.product_id)
    if not product_details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or is inactive.")

    if not cart:
    # Create a new cart for the user
        new_cart = Cart(
            user_id=str(current_user.id),
            items=[CartItemDB(product_id=request.product_id, quantity=request.quantity)]
        )
        cart_dict = new_cart.model_dump(by_alias=True)
        cart_dict["_id"] = ObjectId()
        await db.carts.insert_one(cart_dict)
    else:
        # Check if the product is already in the cart
        item_index = next((i for i, item in enumerate(cart['items']) if item['product_id'] == request.product_id), None)
        if item_index is not None:
            # Update quantity of existing item
            await db.carts.update_one(
                {"user_id": str(current_user.id), f"items.{item_index}.product_id": request.product_id},
                {"$inc": {f"items.{item_index}.quantity": request.quantity}, "$set": {"updated_at": datetime.utcnow()}}
            )
        else:
            # Add new item to cart
            await db.carts.update_one(
                {"user_id": str(current_user.id)},
                {"$push": {"items": CartItemDB(product_id=request.product_id, quantity=request.quantity).model_dump()}, "$set": {"updated_at": datetime.utcnow()}}
            )
    return await get_cart(current_user)


async def _get_product_details(product_id: str) -> Optional[ProductDetails]:
    """
    Looks up a product by stripe_product_id (and optionally by _id) and returns its details if active.
    """
    try:
        # Try by stripe_product_id first
        product_doc = await db.products.find_one({"stripe_product_id": product_id, "active": True})
        print(f"_get_product_details: Lookup by stripe_product_id={product_id} found: {product_doc is not None}")
        if not product_doc:
            # Optionally, try by MongoDB _id if needed
            try:
                product_doc = await db.products.find_one({"_id": ObjectId(product_id), "active": True})
                print(f"_get_product_details: Lookup by _id={product_id} found: {product_doc is not None}")
            except Exception as e:
                print(f"_get_product_details: Error casting product_id to ObjectId: {e}")
                product_doc = None
        if not product_doc:
            return None

        return ProductDetails(
            id=product_doc["stripe_product_id"],
            product_id=str(product_doc["_id"]),  
            name=product_doc["name"],
            description=product_doc.get("description"),
            price=product_doc["price"],
            currency=product_doc["currency"],
            image_url=product_doc.get("image_url"),
            active=product_doc["active"],
            features=product_doc.get("features", []),
            category=product_doc.get("category"),
            interval=product_doc.get("interval"),
            interval_count=product_doc.get("interval_count"),
            # Early Access Fields
            early_access_date=product_doc.get("early_access_date"),
            release_date=product_doc.get("release_date"),
            subscriber_tier_required=product_doc.get("subscriber_tier_required"),
            )
    except Exception as e:
        print(f"Error in _get_product_details: {e}")
        return None

@ecommerce_router.put("/cart/items/{product_id}", response_model=CartView)
async def update_cart_item(product_id: str, request: UpdateCartItemRequest, current_user: User = Depends(get_current_user)):
    """Updates an item's quantity in the cart. If quantity is 0, removes the item."""
    if request.quantity == 0:
        await db.carts.update_one(
            {"user_id": str(current_user.id)},
            {"$pull": {"items": {"product_id": product_id}}, "$set": {"updated_at": datetime.utcnow()}}
        )
    else:
        await db.carts.update_one(
            {"user_id": str(current_user.id), "items.product_id": product_id},
            {"$set": {"items.$.quantity": request.quantity, "updated_at": datetime.utcnow()}}
        )
    return await get_cart(current_user)


@ecommerce_router.delete("/cart/items/{product_id}", response_model=CartView)
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    """Removes an item completely from the cart."""
    await db.carts.update_one(
        {"user_id": str(current_user.id)},
        {"$pull": {"items": {"product_id": product_id}}, "$set": {"updated_at": datetime.utcnow()}}
    )
    return await get_cart(current_user)


@ecommerce_router.post("/cart/checkout")
async def create_checkout_session(request: Request, current_user: User = Depends(get_current_user)):
    """Creates a Stripe Checkout session from the user's cart."""
    cart_doc = await db.carts.find_one({"user_id": str(current_user.id)})
    if not cart_doc or not cart_doc.get('items'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your cart is empty.")

    line_items = []
    for item_data in cart_doc['items']:
        # Get product details from database
        product_doc = await db.products.find_one({"stripe_product_id": item_data['product_id'], "active": True})
        if not product_doc:
            raise HTTPException(status_code=400, detail=f"Product '{item_data['product_id']}' is no longer available.")
        
        # Use the stored price ID from the database
        if not product_doc.get("stripe_price_id"):
            print(f"Product {item_data['product_id']} missing stripe_price_id in database")
            raise HTTPException(status_code=400, detail=f"Product '{item_data['product_id']}' has no price configured.")
        
        price_id = product_doc["stripe_price_id"]
        print(f"Using price ID {price_id} for product {item_data['product_id']}")

        line_items.append({
            "price": price_id,
            "quantity": item_data['quantity'],
        })

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{settings.frontend_url}/dashboard/shop?checkout=success",
            cancel_url=f"{settings.frontend_url}/dashboard/shop?checkout=cancel",
            customer_email=current_user.email, # Pre-fill email
            metadata={
                "user_id": str(current_user.id),
                "cart_id": str(cart_doc['_id'])
            }
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


# --- Public Shop Endpoints ---

@ecommerce_router.get("/shop/products", response_model=List[ProductDetails])
async def get_all_products(current_user: Optional[User] = Depends(get_current_user)):
    """
    Retrieves a list of all active products and subscription plans available in the shop.
    Filters products based on user's subscription access level.
    """
    try:
        products_cursor = db.products.find({"active": True}) # Only fetch active products
        products_list = []
        for product_doc in await products_cursor.to_list(length=100): # Limit length for example
            # Debug: Print raw database data
            print(f"🔍 DEBUG: Raw DB data for '{product_doc['name']}':")
            print(f"🔍 DEBUG:   early_access_date (raw): {product_doc.get('early_access_date')}")
            print(f"🔍 DEBUG:   release_date (raw): {product_doc.get('release_date')}")
            print(f"🔍 DEBUG:   subscriber_tier_required (raw): {product_doc.get('subscriber_tier_required')}")
            
            product = ProductDetails(
                id=product_doc["stripe_product_id"],
                product_id=str(product_doc["_id"]),
                name=product_doc["name"],
                price=product_doc["price"],
                currency=product_doc["currency"],
                description=product_doc.get("description"),
                image_url=product_doc.get("image_url"),
                active=product_doc["active"],
                features=product_doc.get("features"),
                category=product_doc.get("category"),
                interval=product_doc.get("interval"),
                interval_count=product_doc.get("interval_count"),
                # Early Access Fields
                early_access_date=product_doc.get("early_access_date"),
                release_date=product_doc.get("release_date"),
                subscriber_tier_required=product_doc.get("subscriber_tier_required"),
            )
            
            # Debug: Print what was assigned to the product
            print(f"🔍 DEBUG: Product object after creation:")
            print(f"🔍 DEBUG:   early_access_date (assigned): {product.early_access_date}")
            print(f"🔍 DEBUG:   release_date (assigned): {product.release_date}")
            print(f"🔍 DEBUG:   subscriber_tier_required (assigned): {product.subscriber_tier_required}")
            
            products_list.append(product)
        
        # Apply access control filtering
        user_subscription = current_user.subscription if current_user else None
        
        # Debug logging
        print(f"🔍 DEBUG: User subscription: {user_subscription}")
        print(f"🔍 DEBUG: Current time: {datetime.now(timezone.utc)}")
        print(f"🔍 DEBUG: Products before filtering: {len(products_list)}")
        
        for product in products_list:
            print(f"🔍 DEBUG: Product '{product.name}' - early_access: {product.early_access_date}, release: {product.release_date}, required_tier: {product.subscriber_tier_required}")
        
        try:
            filtered_products = filter_products_by_access(
                products_list, 
                user_subscription=user_subscription,
                include_hidden=True  # Show all products including hidden ones with "Coming Soon" status
            )
        except Exception as filter_error:
            print(f"❌ Error in access control filtering: {filter_error}")
            # Fallback: return products without access control if filtering fails
            for product in products_list:
                product.access_status = 'available'
                product.countdown_info = None
            filtered_products = products_list
        
        # Debug: Check final product data being sent to frontend
        print(f"🔍 DEBUG: Final products being sent to frontend:")
        for product in filtered_products:
            print(f"🔍 DEBUG:   {product.name}:")
            print(f"🔍 DEBUG:     early_access_date: {product.early_access_date}")
            print(f"🔍 DEBUG:     release_date: {product.release_date}")
            print(f"🔍 DEBUG:     access_status: {product.access_status}")
            print(f"🔍 DEBUG:     countdown_info: {product.countdown_info}")
        
        print(f"🔍 DEBUG: Products after filtering: {len(filtered_products)}")
        for product in filtered_products:
            print(f"🔍 DEBUG: Filtered product '{product.name}' - access_status: {product.access_status}, countdown: {product.countdown_info}")
        
        return filtered_products
    except Exception as e:
        print(f"❌ Error in get_all_products: {e}")
        return []

@ecommerce_router.get("/admin/products", response_model=List[ProductDetails])
async def get_all_products_admin():
    """
    Admin endpoint to retrieve all products including hidden ones with full early access information.
    """
    products_cursor = db.products.find({}) # Fetch all products including inactive ones
    products_list = []
    for product_doc in await products_cursor.to_list(length=100):
        product = ProductDetails(
            id=product_doc["stripe_product_id"],
            product_id=str(product_doc["_id"]),
            name=product_doc["name"],
            price=product_doc["price"],
            currency=product_doc["currency"],
            description=product_doc.get("description"),
            image_url=product_doc.get("image_url"),
            active=product_doc["active"],
            features=product_doc.get("features"),
            category=product_doc.get("category"),
            interval=product_doc.get("interval"),
            interval_count=product_doc.get("interval_count"),
            # Early Access Fields
            early_access_date=product_doc.get("early_access_date"),
            release_date=product_doc.get("release_date"),
            subscriber_tier_required=product_doc.get("subscriber_tier_required"),
        )
        
        # Add access status for admin view (always show as available for admin)
        product.access_status = "available"
        product.countdown_info = None
        
        products_list.append(product)
    
    return products_list

@ecommerce_router.get("/shop/products/{product_id}", response_model=ProductDetails)
async def get_product_details(product_id: str, current_user: Optional[User] = Depends(get_current_user)):
    """
    Retrieves detailed information about a single product or plan by its Stripe Product ID.
    Includes access control information based on user's subscription.
    """
    product_doc = await db.products.find_one({"stripe_product_id": product_id, "active": True})
    if not product_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or not active.")

    product = ProductDetails(
        id=product_doc["stripe_product_id"],
        name=product_doc["name"],
        price=product_doc["price"],
        currency=product_doc["currency"],
        description=product_doc.get("description"),
        image_url=product_doc.get("image_url"),
        active=product_doc["active"],
        features=product_doc.get("features"),
        category=product_doc.get("category"),
        interval=product_doc.get("interval"),
        interval_count=product_doc.get("interval_count"),
        # Early Access Fields
        early_access_date=product_doc.get("early_access_date"),
        release_date=product_doc.get("release_date"),
        subscriber_tier_required=product_doc.get("subscriber_tier_required"),
    )
    
    # Calculate access information for this specific user
    user_subscription = current_user.subscription if current_user else None
    access_info = calculate_product_access_info(product, user_subscription)
    
    product.access_status = access_info['access_status']
    product.countdown_info = access_info['countdown_info']
    
    # If product is hidden for this user, don't show it
    if access_info['access_status'] == 'hidden':
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or not accessible.")
    
    return product

@ecommerce_router.get("/debug/product/{product_id}")
async def debug_product(product_id: str):
    """
    Debug endpoint to check product details in database.
    """
    product_doc = await db.products.find_one({"stripe_product_id": product_id})
    if not product_doc:
        return {"error": "Product not found in database"}
    
    return {
        "product_id": product_id,
        "database_doc": product_doc,
        "has_stripe_price_id": "stripe_price_id" in product_doc,
        "stripe_price_id": product_doc.get("stripe_price_id"),
        "is_active": product_doc.get("active", False)
    }


# --- Checkout & Payment Endpoints ---

@ecommerce_router.post("/checkout/one-time-purchase")
async def checkout_one_time_purchase(request_data: CreateOneTimePaymentRequest, current_user: User = Depends(get_current_user)):
    """
    Handles a one-time purchase checkout flow using Stripe PaymentIntents.
    """
    customer_id = current_user.customer_id
    if not customer_id:
        customer_id = await generate_customer_id(current_user.email)

    # Calculate total amount
    total_amount_cents = 0
    order_items = []

    # Fetch product details from your DB to ensure valid prices and existence
    for item_in_cart in request_data.items:
        product_doc = await db.products.find_one({"stripe_product_id": item_in_cart.product_id, "active": True})
        if not product_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {item_in_cart.product_id} not found or inactive.")
        
        # Use price from DB for calculation
        item_price_cents = int(product_doc["price"] * 100)
        total_amount_cents += item_price_cents * item_in_cart.quantity
        order_items.append(OrderItem(
            product_id=product_doc["stripe_product_id"],
            name=product_doc["name"],
            quantity=item_in_cart.quantity,
            price=product_doc["price"], # Store original price
            currency=product_doc["currency"],
            image_url=product_doc.get("image_url")
        ))
    
    if total_amount_cents == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty or prices are zero.")

    try:
        # Create a PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=total_amount_cents,
            currency="usd", # Ensure currency matches your price setup
            customer=customer_id,
            payment_method_types=["card"],
            metadata={"user_id": str(current_user.id), "order_type": "one_time_purchase"}
        )

        # Create an Order document in MongoDB
        new_order = Order(
            user_id=str(current_user.id),
            items=order_items,
            total_amount=total_amount_cents / 100, # Store in dollars
            currency="usd",
            stripe_payment_intent_id=payment_intent.id,
            status="pending", # Initial status
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        await db.orders.insert_one(new_order.model_dump(by_alias=True, exclude_none=True))

        return {"client_secret": payment_intent.client_secret, "order_id": str(new_order.id)}

    except StripeError as e:
        print(f"Stripe error during one-time purchase checkout: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        print(f"Error during one-time purchase checkout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during checkout: {str(e)}"
        )


@ecommerce_router.post("/subscribe", status_code=status.HTTP_200_OK)
async def subscribe_to_plan(
    subscribe_data: SubscribePlans,
    current_user: User = Depends(get_current_user)
):
    """
    Handles subscription to a Stripe plan.
    """
    customer_id = current_user.customer_id
    if not customer_id:
        customer_id = await generate_customer_id(current_user.email)

    try:
        # Retrieve the price ID from your MongoDB
        product_doc = await db.products.find_one({"stripe_product_id": subscribe_data.product_id, "active": True})
        if not product_doc or not product_doc.get("stripe_price_id"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or not a subscription plan.")

        price_id = product_doc["stripe_price_id"]

        # Create a Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=f"{settings.frontend_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/cancel",
            metadata={"user_id": str(current_user.id), "order_type": "subscription"}
        )
        return {"checkout_url": checkout_session.url}

    except StripeError as e:
        print(f"Stripe error during subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        print(f"Error subscribing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while subscribing: {str(e)}"
        )

@ecommerce_router.post("/unsubscribe", status_code=status.HTTP_200_OK)
async def unsubscribe_from_plan(
    unsubscribe_request: UnSubscribeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Cancels a Stripe subscription for the current user.
    """
    # Verify the subscription belongs to the current user (optional but recommended)
    # You might need to fetch subscriptions from Stripe or store them in your DB
    try:
        subscription = stripe.Subscription.retrieve(unsubscribe_request.subscription_id)
        if subscription.customer != current_user.customer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Subscription does not belong to this user.")

        canceled_subscription = stripe.Subscription.delete(unsubscribe_request.subscription_id)

        # Optionally, issue a prorated refund here based on `canceled_subscription` details
        refund_issued = False
        # Example: if you wanted to refund remaining days
        # if canceled_subscription.current_period_end > datetime.now().timestamp():
        #     # Calculate prorated amount and create a Refund (more complex logic needed here)
        #     pass

        return {
            "status": canceled_subscription.status,
            "refund": refund_issued,
            "refund_message": "Refund processed." if refund_issued else "No refund applicable or failed to process refund.",
        }

    except StripeError as e:
        print(f"Stripe error during unsubscribe: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stripe error: {e._message}",
        )
    except Exception as e:
        print(f"Error unsubscribing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while canceling the subscription: {str(e)}"
        )

## Webhooks & Order Management

@ecommerce_router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request):
    """
    Handles incoming Stripe webhook events. This is critical for updating your
    database in response to payment successes, failures, and subscription changes.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stripe-Signature header missing.")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid signature: {e}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Webhook processing error: {e}")

    # Handle the event
    event_type = event["type"]
    data = event["data"]
    object = data["object"]

    try:
        if event_type == "checkout.session.completed":
            print(f"Checkout Session Completed: {object['id']}")
            # Retrieve the Stripe Payment Intent ID from the session
            payment_intent_id = object.get("payment_intent")
            if payment_intent_id:
                # Find and update the order in your database
                await db.orders.update_one(
                    {"stripe_payment_intent_id": payment_intent_id},
                    {"$set": {"status": "paid", "updated_at": datetime.utcnow()}}
                )
                print(f"Order for PaymentIntent {payment_intent_id} marked as 'paid'.")

        elif event_type == "payment_intent.succeeded":
            print(f"Payment Intent Succeeded: {object['id']}")
            # Find and update the order in your database
            await db.orders.update_one(
                {"stripe_payment_intent_id": object["id"]},
                {"$set": {"status": "paid", "updated_at": datetime.utcnow()}}
            )
            print(f"Order for PaymentIntent {object['id']} marked as 'paid'.")

        elif event_type == "payment_intent.payment_failed":
            print(f"Payment Intent Failed: {object['id']}")
            await db.orders.update_one(
                {"stripe_payment_intent_id": object["id"]},
                {"$set": {"status": "failed", "updated_at": datetime.utcnow()}}
            )

        elif event_type == "customer.subscription.created":
            print(f"Subscription created: {object['id']}")
            # You might want to store subscription details in your DB
            # For example, link to a user and the product/price subscribed to.

        elif event_type == "customer.subscription.updated":
            print(f"Subscription updated: {object['id']} - Status: {object['status']}")
            # Update subscription status in your DB if you store them

        elif event_type == "customer.subscription.deleted":
            print(f"Subscription deleted: {object['id']}")
            # Mark subscription as cancelled/inactive in your DB

        else:
            print(f"Unhandled event type: {event_type}")

    except Exception as e:
        print(f"Error processing webhook event {event_type}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing webhook: {str(e)}")

    return {"status": "success"}

@ecommerce_router.post("/upload/image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    """
    Uploads an image file to the server and returns its URL.
    """
    try:
        # Generate a unique filename to prevent collisions
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOADS_DIR / unique_filename

        # Save the file to the uploads directory
        with open(file_path, "wb") as f:
            f.write(await file.read())

        image_url = f"static/uploads/{unique_filename}"
        return {"image_url": image_url}
    except Exception as e:
        print(f"Error uploading image: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not upload image: {str(e)}")

# --- New: Order Tracking Endpoint ---
@ecommerce_router.get("/orders/{order_id}")
async def get_order_status(order_id: str):
    """
    Retrieves the status of a specific order by its MongoDB ID.
    Note: For security, you might want to add user authentication here
    to ensure only the order owner can view its status, or require
    additional verification like email/zip code associated with the order.
    """
    try:
        # Convert string ID to ObjectId for MongoDB lookup
        obj_id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Order ID format.")

    order_doc = await db.orders.find_one({"_id": obj_id})

    if not order_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    return {"order_id": str(order_doc["_id"]), "status": order_doc["status"]}

@ecommerce_router.get("/debug/products")
async def debug_products():
    """
    Debug endpoint to check what's in the database
    """
    try:
        products_cursor = db.products.find({})
        products_list = []
        for product_doc in await products_cursor.to_list(length=100):
            products_list.append({
                "name": product_doc["name"],
                "early_access_date": product_doc.get("early_access_date"),
                "release_date": product_doc.get("release_date"),
                "subscriber_tier_required": product_doc.get("subscriber_tier_required"),
                "active": product_doc.get("active"),
                "current_time": datetime.now(timezone.utc).isoformat()
            })
        
        return {
            "products": products_list,
            "total_count": len(products_list)
        }
    except Exception as e:
        print(f"❌ Debug products error: {e}")
        return {
            "error": str(e),
            "products": [],
            "total_count": 0
        }

@ecommerce_router.get("/test")
async def test_endpoint():
    """
    Simple test endpoint to check if the router is working
    """
    try:
        # Test database connection and get one product
        product_doc = await db.products.find_one({"name": "slkjflskjf"})
        if product_doc:
            return {
                "message": "Ecommerce router is working",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "test_product": {
                    "name": product_doc.get("name"),
                    "early_access_date": str(product_doc.get("early_access_date")),
                    "release_date": str(product_doc.get("release_date")),
                    "subscriber_tier_required": product_doc.get("subscriber_tier_required"),
                    "active": product_doc.get("active")
                }
            }
        else:
            return {
                "message": "Ecommerce router is working",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "test_product": "Product not found"
            }
    except Exception as e:
            return {
        "message": "Ecommerce router error",
        "error": str(e),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@ecommerce_router.get("/fix-product")
async def fix_product():
    """
    Temporary endpoint to fix the product's early access date
    """
    try:
        # Update the product with the correct early access date
        result = await db.products.update_one(
            {"name": "slkjflskjf"},
            {
                "$set": {
                    "early_access_date": datetime(2025, 8, 22, 18, 0, 0, tzinfo=timezone.utc),
                    "release_date": datetime(2025, 8, 29, 18, 0, 0, tzinfo=timezone.utc),
                    "subscriber_tier_required": "CapitalKV Exclusive"
                }
            }
        )
        
        if result.modified_count > 0:
            return {
                "message": "Product updated successfully",
                "modified_count": result.modified_count
            }
        else:
            return {
                "message": "Product not found or no changes made",
                "modified_count": result.modified_count
            }
    except Exception as e:
        return {
            "error": str(e)
        }

@ecommerce_router.get("/time-check")
async def time_check():
    """
    Check what time the backend thinks it is
    """
    # Get current time in different timezones
    utc_now = datetime.now(timezone.utc)
    local_now = datetime.now()  # Server local time
    
    return {
        "utc_time": utc_now.isoformat(),
        "local_time": local_now.isoformat(),
        "utc_hour": utc_now.hour,
        "local_hour": local_now.hour,
        "timezone_info": {
            "utc_offset": str(utc_now.utcoffset()),
            "local_tzname": str(local_now.tzname()),
            "is_dst": str(local_now.dst()) if local_now.dst() else "None"
        }
    }

@ecommerce_router.get("/debug-product/{product_name}")
async def debug_specific_product(product_name: str):
    """
    Debug endpoint to check a specific product's data
    """
    try:
        product_doc = await db.products.find_one({"name": product_name})
        if product_doc:
            current_time = datetime.now(timezone.utc)
            early_access_date = product_doc.get("early_access_date")
            release_date = product_doc.get("release_date")
            
            # Handle timezone-aware comparisons safely
            try:
                # Calculate expected access status with proper timezone handling
                access_status = "unknown"
                if not early_access_date or not release_date:
                    access_status = "available (no early access configured)"
                else:
                    # Ensure dates are timezone-aware for comparison
                    if early_access_date and early_access_date.tzinfo is None:
                        early_access_date = early_access_date.replace(tzinfo=timezone.utc)
                    if release_date and release_date.tzinfo is None:
                        release_date = release_date.replace(tzinfo=timezone.utc)
                    
                    if current_time >= release_date:
                        access_status = "available (past release date)"
                    elif current_time >= early_access_date:
                        access_status = "early_access or countdown (in early access period)"
                    else:
                        access_status = "hidden (before early access period)"
                
                return {
                    "product_name": product_name,
                    "raw_database_data": {
                        "name": product_doc.get("name"),
                        "early_access_date": str(product_doc.get("early_access_date")),
                        "release_date": str(product_doc.get("release_date")),
                        "subscriber_tier_required": product_doc.get("subscriber_tier_required"),
                        "active": product_doc.get("active"),
                        "stripe_product_id": product_doc.get("stripe_product_id")
                    },
                    "current_time": current_time.isoformat(),
                    "expected_access_status": access_status,
                    "time_analysis": {
                        "current_time": current_time.isoformat(),
                        "early_access_time": early_access_date.isoformat() if early_access_date else "None",
                        "release_time": release_date.isoformat() if release_date else "None",
                        "is_before_early_access": current_time < early_access_date if early_access_date else "N/A",
                        "is_in_early_access_period": early_access_date <= current_time < release_date if early_access_date and release_date else "N/A",
                        "is_after_release": current_time >= release_date if release_date else "N/A"
                    }
                }
            except Exception as timezone_error:
                return {
                    "product_name": product_name,
                    "error": f"Timezone comparison error: {str(timezone_error)}",
                    "raw_database_data": {
                        "name": product_doc.get("name"),
                        "early_access_date": str(product_doc.get("early_access_date")),
                        "release_date": str(product_doc.get("release_date")),
                        "subscriber_tier_required": product_doc.get("subscriber_tier_required"),
                        "active": product_doc.get("active"),
                        "stripe_product_id": product_doc.get("stripe_product_id")
                    },
                    "current_time": current_time.isoformat(),
                    "timezone_error_details": str(timezone_error)
                }
        else:
            return {
                "error": f"Product '{product_name}' not found"
            }
    except Exception as e:
        return {
            "error": str(e)
        }

@ecommerce_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user)):
    """
    Retrieves a list of orders for the current user.
    If an admin user, return all orders or top 10.
    """
    try:
        if current_user.is_admin_user:
            return await db.orders.find().sort("created_at", -1).limit(10).to_list(10)
        else:
            return await db.orders.find({"user_id": current_user.id}).sort("created_at", -1).limit(10).to_list(10)
    except Exception as e:
        print(f"Error retrieving orders: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving orders.")