#!/usr/bin/env python3
"""
Debug timezone issue with product access
"""

from datetime import datetime, timezone, timedelta
from app.ecommerce.access_control import calculate_product_access_info
from app.ecommerce.models import ProductDetails

def debug_timezone_issue():
    """Debug the timezone issue with product access"""
    
    print("🔍 Debugging Timezone Issue...")
    
    # Current times
    utc_now = datetime.now(timezone.utc)
    local_now = datetime.now()
    
    print(f"Current UTC Time: {utc_now}")
    print(f"Current Local Time: {local_now}")
    print(f"Timezone Difference: {local_now.hour - utc_now.hour} hours")
    print()
    
    # Simulate your product with the times you mentioned
    # You added at 11:31 and set early access to 11:33
    # Assuming this was today (August 22nd)
    
    # Convert your local times to UTC
    # If you set 11:33 local time, that's 6:33 UTC (11:33 - 5 hours)
    early_access_local = datetime(2025, 8, 22, 11, 33, 0)  # Your local time
    early_access_utc = early_access_local.replace(tzinfo=timezone.utc) - timedelta(hours=5)  # Convert to UTC
    
    release_date_local = datetime(2025, 8, 29, 11, 33, 0)  # 1 week later
    release_date_utc = release_date_local.replace(tzinfo=timezone.utc) - timedelta(hours=5)  # Convert to UTC
    
    print(f"Your Local Times:")
    print(f"  Early Access: {early_access_local} (Local)")
    print(f"  Release Date: {release_date_local} (Local)")
    print()
    print(f"Converted to UTC:")
    print(f"  Early Access: {early_access_utc}")
    print(f"  Release Date: {release_date_utc}")
    print()
    
    # Create test product
    product = ProductDetails(
        id="test_timezone",
        name="Test Timezone Product",
        price=99.99,
        currency="usd",
        active=True,
        early_access_date=early_access_utc,
        release_date=release_date_utc,
        subscriber_tier_required="CapitalKV Exclusive"
    )
    
    # Test access at different times
    test_times = [
        {
            "name": "Right now",
            "time": utc_now
        },
        {
            "name": "Your local 11:33 (converted to UTC)",
            "time": early_access_utc
        },
        {
            "name": "1 minute after your local 11:33",
            "time": early_access_utc + timedelta(minutes=1)
        },
        {
            "name": "Your local time now",
            "time": datetime.now().replace(tzinfo=timezone.utc) - timedelta(hours=5)
        }
    ]
    
    for test in test_times:
        print(f"📅 Testing: {test['name']}")
        print(f"   Test Time: {test['time']}")
        
        result = calculate_product_access_info(product, "free_trial", test['time'])
        
        print(f"   Status: {result['access_status']}")
        print(f"   Can Purchase: {result['can_purchase']}")
        if result['countdown_info']:
            print(f"   Countdown: {result['countdown_info']['display']}")
        print()
    
    # Check if the issue is with the time comparison
    print("🔍 Time Comparison Analysis:")
    print(f"Current UTC: {utc_now}")
    print(f"Early Access UTC: {early_access_utc}")
    print(f"Is current time >= early access? {utc_now >= early_access_utc}")
    print(f"Time difference: {early_access_utc - utc_now}")
    
    print("\n🎯 Debug completed!")

if __name__ == "__main__":
    debug_timezone_issue()
