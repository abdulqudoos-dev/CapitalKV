from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.auth.utils import get_current_active_user
from app.auth.models import User
from app.integrations.models import (
    Integration, IntegrationCreate, IntegrationUpdate,
    IntegrationStatus, IntegrationProvider, IntegrationTestResult,
    IntegrationMetrics
)
from app.integrations.utils import (
    get_integration_by_id, get_user_integrations,
    test_integration_connection, sync_integration_data
)
from app.database import db

router = APIRouter()

@router.post("/", response_model=Integration)
async def create_integration(
    integration: IntegrationCreate,
    current_user: User = Depends(get_current_active_user)
):
    integration_dict = integration.dict()
    integration_dict.update({
        "user_id": current_user.username,
        "status": IntegrationStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_sync": None,
        "error_message": None
    })
    
    # Test the integration connection
    test_success = await test_integration_connection(integration_dict)
    if test_success:
        integration_dict["status"] = IntegrationStatus.ACTIVE
    else:
        integration_dict["status"] = IntegrationStatus.FAILED
        integration_dict["error_message"] = "Failed to establish connection"

    result = await db.integrations.insert_one(integration_dict)
    integration_dict["id"] = str(result.inserted_id)
    return integration_dict

@router.get("/", response_model=List[Integration])
async def get_integrations(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    integration_type: Optional[str] = None,
    provider: Optional[IntegrationProvider] = None,
    status: Optional[IntegrationStatus] = None,
    current_user: User = Depends(get_current_active_user)
):
    integrations = await get_user_integrations(
        current_user.username,
        skip,
        limit,
        integration_type,
        provider,
        status
    )
    return integrations

@router.get("/{integration_id}", response_model=Integration)
async def get_integration(
    integration_id: str,
    current_user: User = Depends(get_current_active_user)
):
    integration = await get_integration_by_id(integration_id, current_user.username)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration

@router.put("/{integration_id}", response_model=Integration)
async def update_integration(
    integration_id: str,
    integration_update: IntegrationUpdate,
    current_user: User = Depends(get_current_active_user)
):
    integration = await get_integration_by_id(integration_id, current_user.username)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    update_data = integration_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()

    await db.integrations.update_one(
        {"_id": ObjectId(integration_id)},
        {"$set": update_data}
    )

    return await get_integration_by_id(integration_id, current_user.username)

@router.delete("/{integration_id}")
async def delete_integration(
    integration_id: str, current_user: User = Depends(get_current_active_user)
):
    integration = await get_integration_by_id(integration_id, current_user.username)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    await db.integrations.delete_one({"_id": ObjectId(integration_id)})
    return {"message": "Integration deleted successfully"}

@router.post("/{integration_id}/test", response_model=IntegrationTestResult)
async def test_integration(
    integration_id: str,
    current_user: User = Depends(get_current_active_user)
):
    integration = await get_integration_by_id(integration_id, current_user.username)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    test_success = await test_integration_connection(integration)
    if test_success:
        return {"success": True, "message": "Integration test successful"}
    else:
        return {"success": False, "message": "Integration test failed"}

@router.post("/{integration_id}/sync", response_model=IntegrationMetrics)
async def sync_integration(
    integration_id: str,
    current_user: User = Depends(get_current_active_user)
):
    integration = await get_integration_by_id(integration_id, current_user.username)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    sync_success = await sync_integration_data(integration_id)
    if sync_success:
        return {"total_requests": 0, "successful_requests": 0, "failed_requests": 0, "average_response_time": 0.0, "last_sync_status": True, "error_rate": 0.0}
    else:
        return {"total_requests": 0, "successful_requests": 0, "failed_requests": 0, "average_response_time": 0.0, "last_sync_status": False, "error_rate": 0.0}