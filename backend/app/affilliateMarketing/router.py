import uuid

from fastapi import APIRouter, HTTPException
from pydantic import EmailStr

from db.database import links_collection, clicks_collection, affliate_user
from schema.user import AffiliateLink, AffliateUser

router = APIRouter(
    prefix='/models',
    tags=['models']
)


@router.post('/create', response_description="create the user for affliation", response_model=AffliateUser)
async def create_user(userId: str, email: EmailStr):
    existing_user = await affliate_user.find_one({"user_Id": userId})
    if existing_user:
        raise HTTPException(status_code=400, detail="Affiliate with this email already exists")

    await affliate_user.insert_one({
        "user_Id": userId,
        "email": email
    })
    response = AffliateUser(
        user_id=userId,
        email=email
    )
    return response


@router.post('/generate_affiliation_link', response_description='generate link', response_model=AffiliateLink)
async def generate_affiliate_link(user_id: str, affiliate_link: str):
    affiliate_id = f"{user_id}-{uuid.uuid4()}"

    # Create a query string with the affiliate ID

    # Store the affiliate link in the database
    await links_collection.insert_one({
        "user_id": user_id,
        "affiliate_id": affiliate_id,
        "link": affiliate_link
    })

    # Return an instance of AffiliateLink
    response = AffiliateLink(
        user_id=user_id,
        affiliate_id=affiliate_id,
        link=affiliate_link
    )

    # Optional: Log the response for debugging
    print(response)

    return response


@router.post("/track_click")
async def track_click(affiliate_link_id: str):
    click = {"affiliate_link_id": affiliate_link_id, "timestamp": str(uuid.uuid4())}
    await clicks_collection.insert_one(click)
    return {"message": "Click tracked"}


@router.get("/click_count")
async def get_click_count(aff_id: str):
    click_count = await clicks_collection.count_documents({"affiliate_link_id": aff_id})
    return {"affiliate_link_id": aff_id, "click_count": click_count}
