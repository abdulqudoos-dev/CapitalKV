from app.database import db
from datetime import datetime
from bson import ObjectId
from typing import List, Optional, Dict
from app.integrations.models import Integration, IntegrationStatus, IntegrationProvider
import logging

async def get_integration_by_id(integration_id: str, user_id: str) -> Optional[dict]:
    try:
        integration = await db.integrations.find_one({
            "_id": ObjectId(integration_id),
            "user_id": user_id
        })
        if integration:
            integration["id"] = str(integration["_id"])
        return integration
    except:
        return None

async def get_user_integrations(
    user_id: str,
    skip: int = 0,
    limit: int = 10,
    integration_type: Optional[str] = None,
    provider: Optional[IntegrationProvider] = None,
    status: Optional[IntegrationStatus] = None
) -> List[dict]:
    query = {"user_id": user_id}
    
    if integration_type:
        query["integration_type"] = integration_type
    if provider:
        query["provider"] = provider
    if status:
        query["status"] = status

    cursor = db.integrations.find(query).skip(skip).limit(limit)
    integrations = await cursor.to_list(length=limit)
    
    for integration in integrations:
        integration["id"] = str(integration["_id"])
    
    return integrations

async def test_integration_connection(integration: Dict) -> bool:
    # Implement the actual integration testing logic here
    # This is a placeholder implementation
    try:
        provider = integration["provider"]
        credentials = integration["credentials"]
        
        # Add provider-specific connection testing logic here
        if provider == IntegrationProvider.MAILCHIMP:
            # Test Mailchimp connection
            pass
        elif provider == IntegrationProvider.SENDGRID:
            # Test SendGrid connection
            pass
        # Add more provider-specific testing logic
        
        return True
    except Exception as e:
        logging.error(f"Integration test failed: {str(e)}")
        return False

async def sync_integration_data(integration_id: str) -> bool:
    # Implement the actual data synchronization logic here
    try:
        integration = await db.integrations.find_one({"_id": ObjectId(integration_id)})
        if not integration:
            return False
            
        # Add provider-specific sync logic here
        
        # Update last sync timestamp
        await db.integrations.update_one(
            {"_id": ObjectId(integration_id)},
            {
                "$set": {
                    "last_sync": datetime.utcnow(),
                    "status": IntegrationStatus.ACTIVE
                }
            }
        )
        return True
    except Exception as e:
        logging.error(f"Integration sync failed: {str(e)}")
        return False