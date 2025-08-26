# app/ecommerce/access_control.py

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from .models import ProductDetails


def calculate_product_access_info(
    product: ProductDetails, 
    user_subscription: Optional[str] = None,
    current_time: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Calculate access status and countdown information for a product based on user subscription.
    
    Args:
        product: details including early access and release dates
        user_subscription: User's current subscription tier (e.g., 'CapitalKV Exclusive', 'CapitalKV+', 'free_trial')
        current_time: Current timestamp (defaults to now)
    
    Returns:
        Dict containing:
        - access_status: 'available', 'early_access', 'countdown', 'hidden'
        - countdown_info: Dict with countdown details if applicable
        - can_purchase: Boolean indicating if user can purchase
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)
    
    # Ensure current_time is timezone-aware
    if current_time.tzinfo is None:
        current_time = current_time.replace(tzinfo=timezone.utc)
    
    # Convert product dates to timezone-aware if they're naive
    early_access_date = product.early_access_date
    release_date = product.release_date
    
    # Handle naive datetimes by assuming they're in UTC
    if early_access_date and early_access_date.tzinfo is None:
        early_access_date = early_access_date.replace(tzinfo=timezone.utc)
    
    if release_date and release_date.tzinfo is None:
        release_date = release_date.replace(tzinfo=timezone.utc)
    
    # Debug logging
    print(f"🔍 DEBUG: Calculating access for '{product.name}'")
    print(f"🔍 DEBUG: Current time: {current_time}")
    print(f"🔍 DEBUG: Early access date: {early_access_date}")
    print(f"🔍 DEBUG: Release date: {release_date}")
    print(f"🔍 DEBUG: User subscription: {user_subscription}")
    print(f"🔍 DEBUG: Required tier: {product.subscriber_tier_required}")
    
    # If no early access configured, product is available to everyone
    if not early_access_date or not release_date:
        print(f"🔍 DEBUG: No early access configured - returning 'available'")
        return {
            'access_status': 'available',
            'countdown_info': None,
            'can_purchase': True,
            'message': None
        }
    
    # Check if generally available (past release date)
    if current_time >= release_date:
        print(f"🔍 DEBUG: Past release date - returning 'available'")
        return {
            'access_status': 'available',
            'countdown_info': None,
            'can_purchase': True,
            'message': None
        }
    
    # Check if in early access period
    if current_time >= early_access_date:
        print(f"🔍 DEBUG: In early access period")
        # User has required subscription for early access
        if (user_subscription and 
            product.subscriber_tier_required and 
            user_subscription in ['Active CapitalKV Exclusive', 'CapitalKV Exclusive']):
            print(f"🔍 DEBUG: User has early access - returning 'early_access'")
            return {
                'access_status': 'early_access',
                'countdown_info': None,
                'can_purchase': True,
                'message': 'Early Access - CapitalKV Exclusive Members Only'
            }
        else:
            # In early access period but user doesn't have required subscription
            print(f"🔍 DEBUG: User doesn't have early access - returning 'countdown'")
            countdown = calculate_countdown(current_time, release_date)
            return {
                'access_status': 'countdown',
                'countdown_info': countdown,
                'can_purchase': False,
                'message': f"Available in {countdown['display']}"
            }
    
    # Before early access period - completely hidden
    print(f"🔍 DEBUG: Before early access period - returning 'hidden'")
    return {
        'access_status': 'hidden',
        'countdown_info': None,
        'can_purchase': False,
        'message': 'Coming Soon'
    }


def calculate_countdown(current_time: datetime, target_time: datetime) -> Dict[str, Any]:
    """
    Calculate countdown information between current time and target time.
    
    Args:
        current_time: Current datetime (timezone-aware)
        target_time: Target datetime (timezone-aware)
    
    Returns:
        Dict with days, hours, minutes, and formatted display string
    """
    # Ensure both datetimes are timezone-aware
    if current_time.tzinfo is None:
        current_time = current_time.replace(tzinfo=timezone.utc)
    if target_time.tzinfo is None:
        target_time = target_time.replace(tzinfo=timezone.utc)
        
    if target_time <= current_time:
        return {
            'days': 0,
            'hours': 0,
            'minutes': 0,
            'display': 'Available now',
            'expired': True
        }
    
    time_diff = target_time - current_time
    days = time_diff.days
    hours, remainder = divmod(time_diff.seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    
    # Format display string
    if days > 0:
        display = f"{days}d {hours}h"
    elif hours > 0:
        display = f"{hours}h {minutes}m"
    else:
        display = f"{minutes}m"
    
    return {
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'display': display,
        'expired': False,
        'total_seconds': int(time_diff.total_seconds())
    }


def filter_products_by_access(
    products: list[ProductDetails], 
    user_subscription: Optional[str] = None,
    current_time: Optional[datetime] = None,
    include_hidden: bool = False
) -> list[ProductDetails]:
    """
    Filter and annotate products based on user's access level.
    
    Args:
        products: List of products to filter
        user_subscription: User's subscription tier
        current_time: Current timestamp
        include_hidden: Whether to include hidden products (for admin views)
    
    Returns:
        List of products with access information added
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)
    
    filtered_products = []
    
    for product in products:
        access_info = calculate_product_access_info(product, user_subscription, current_time)
        
        # Skip hidden products unless explicitly requested
        if access_info['access_status'] == 'hidden' and not include_hidden:
            continue
        
        # Add access information to product
        product.access_status = access_info['access_status']
        product.countdown_info = access_info['countdown_info']
        
        filtered_products.append(product)
    
    return filtered_products


def user_has_early_access(user_subscription: Optional[str], required_tier: str) -> bool:
    """
    Check if user's subscription provides early access for a specific tier requirement.
    """
    if not user_subscription or not required_tier:
        return False
    
    # Map subscription values to access levels
    exclusive_subscriptions = [
        'Active CapitalKV Exclusive',
        'CapitalKV Exclusive'
    ]
    
    plus_subscriptions = [
        'Active CapitalKV+',
        'CapitalKV+'
    ]
    
    if required_tier == 'CapitalKV Exclusive':
        return user_subscription in exclusive_subscriptions
    elif required_tier == 'CapitalKV+':
        return user_subscription in (exclusive_subscriptions + plus_subscriptions)
    
    return False
