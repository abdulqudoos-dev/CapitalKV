from fastapi import APIRouter, Body, HTTPException, File, Form, Path, UploadFile, status, Depends
from fastapi.responses import FileResponse
from app.users.models import (
    ManagaUserDetails,
    UpdateSubscriptionRequest,
    UpdateUserStatusRequest,
    User,
    Deposit,
    WithDraw,
    UserProfileUpdate,
    AccountDetails,
    UserDetails,
    UserProfile,
    UserActivity,
    UserStats,
    PasswordUpdate,
    AffliliateLinks,
    AffiliateLinkUpdate,
    Bussiness,
    AffiliateLinkBase,
    Avatar,
)
import shutil
import os
from typing import List
from app.auth.utils import get_current_user, get_current_active_user
from app.users.utils import (
    delete_image,
    get_user_profile,
    update_user_profile,
    get_user_stats,
    get_user_recent_activity,
    log_user_activity,
    verify_current_password,
    update_user_password,
    get_image_path,
)
from app.database import db
from app.config import settings
import logging
from app.payments.utils import generate_customer_id
from bson import ObjectId
from app.chat.models import Group, GroupMember, Message
from typing import Optional


import stripe

from app.blog.utils import UPLOAD_FOLDER

stripe.api_key = settings.stripe_api_key
users_router = APIRouter()


@users_router.get("/all")
async def read_users(current_user: User = Depends(get_current_user)):
    users = await db.engine.find(User)
    return users


@users_router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@users_router.get("/me/allUsers", response_model=List[ManagaUserDetails])
async def read_all_users():
    users = await db.engine.find(User)
    return [ManagaUserDetails(
        id=str(user.id),  
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        is_admin_user=user.is_admin_user,
        phone_number=user.phone_number,
        email=user.email,
        is_active=user.is_active,
        subscription=user.subscription
    ) for user in users]


@users_router.put("/me/updateSubscription/{user_id}")
async def update_subscription(
    user_id: str = Path(..., description="The ID of the user to update"),
    data: UpdateSubscriptionRequest = Body(...)
):
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await db.engine.find_one(User, User.id == object_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.subscription = data.subscription
    await db.engine.save(user)

    return {
        "message": "Subscription updated successfully",
        "user": str(user.email),
        "subscription": user.subscription
    }

@users_router.put("/me/updateStatus/{user_id}")
async def update_user_status(
    user_id: str = Path(..., description="The ID of the user to update"),
    data: UpdateUserStatusRequest = Body(...)
):
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await db.engine.find_one(User, User.id == object_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = data.is_active
    user.subscription = data.subscription
    await db.engine.save(user)

    return {
        "message": f"User {'activated' if data.is_active else 'terminated'} successfully",
        "user": str(user.email),
        "is_active": user.is_active
    }

@users_router.get("/me/user_image/{id}")
async def get_user_image(id: str):

    user = await db.engine.find_one(User, User.id == ObjectId(id))
    if not user or not user.profile_picture_url:
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(user.profile_picture_url, media_type="image/jpeg") 


@users_router.put("/me")
async def update_current_user_profile(
    first_name: str = Form(None),
    last_name: str = Form(None),
    full_name: str = Form(None),
    company: str = Form(None),
    phone_number: str = Form(None),
    bio: str = Form(None),
    website: str = Form(None),
    balance: int = Form(0),
    avatar: UploadFile = File(None),  # File upload
    current_user: User = Depends(get_current_user)
):
    existing_user = await db.engine.find_one(User, User.email == current_user.email)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User profile not found")

    if full_name:
        existing_user.full_name = full_name
    if first_name:
        existing_user.first_name = first_name
    if last_name:
        existing_user.last_name = last_name
    if company:
        existing_user.company = company
    if phone_number:
        existing_user.phone_number = phone_number
    if website:
        existing_user.website = website
    if bio:
        existing_user.bio = bio
    if balance:
        existing_user.balance = balance
   
    if avatar:
        uploads_dir = "uploads/"  
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, avatar.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        
        existing_user.profile_picture_url = file_path  # Save only the file path, not UploadFile object

    await db.engine.save(existing_user)

    return {
        "status": "Success",
        "updated_user": existing_user
    }

@users_router.post("/me/topup", response_model=dict)
async def deposit_success(
    deposit: Deposit, current_user: User = Depends(get_current_user)
):
    try:
        # Validate deposit amount
        if deposit.amount <= 0:
            raise HTTPException(
                status_code=400, detail="Deposit amount must be greater than zero"
            )

        # Find the user in the database
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Update the user's balance
        existing_user.balance = (existing_user.balance or 0) + deposit.amount
        await db.engine.save(existing_user)

        # Return success response
        return {
            "status": "success",
            "message": "Deposit successful",
            "new_balance": existing_user.balance,
        }

    except Exception as e:
        logging.error(f"Error processing deposit: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


# Endpoint to create business
@users_router.post("/me/business", response_model=dict)
async def create_business(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    fundSize: float = Form(None),
    roi: float = Form(...),
    status: str = Form(...),
    logo: UploadFile | None = File(None),  # Make logo optional
    current_user: User = Depends(get_current_user),
):
    try:
        # Validate user
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        file_path = ""
        if logo:
            # Save the uploaded file
            uploads_dir = "uploads/"  # Directory to save images
            os.makedirs(uploads_dir, exist_ok=True)
            file_path = os.path.join(uploads_dir, logo.filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(logo.file, buffer)

        # Create the business record
        new_business = Bussiness(
            title=title,
            description=description,
            price=price,
            fundSize=fundSize,
            roi=roi,
            status=status,
            logo=file_path,  # Save file path
            user_id=ObjectId(current_user.id),
        )
        await db.engine.save(new_business)

        # Return success response
        return {
            "status": "success",
            "message": "Business created successfully",
            "business": {
                "title": new_business.title,
                "description": new_business.description,
                "logo": file_path,
                "fundSize": new_business.fundSize,
                "roi": new_business.roi,
                "price": new_business.price,
            },
        }

    except Exception as e:
        logging.error(f"Error creating business: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")




@users_router.put("/me/business/{business_id}", response_model=dict)
async def edit_business(
    business_id: str,
    title: str = Form(None),  # Optional fields for editing
    description: str = Form(None),
    price: float = Form(None),
    roi: float = Form(None),
    fundSize: float = Form(None),
    status: str = Form(None),
    logo: UploadFile = File(None),  # Logo can be null
    current_user: User = Depends(get_current_user),
):
    try:
        # Validate user
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Find the existing business by ID
        existing_business = await db.engine.find_one(
            Bussiness, Bussiness.id == ObjectId(business_id)
        )
        if not existing_business:
            raise HTTPException(status_code=404, detail="Business not found")

        # Update the logo if provided
        if logo:
            uploads_dir = "uploads/"  # Directory to save images
            os.makedirs(uploads_dir, exist_ok=True)
            file_path = os.path.join(uploads_dir, logo.filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(logo.file, buffer)

            existing_business.logo = file_path

        # Update other fields if provided
        if title:
            existing_business.title = title
        if description:
            existing_business.description = description
        if price is not None:
            existing_business.price = price
        if roi is not None:
            existing_business.roi = roi
        if fundSize is not None:
            existing_business.fundSize = fundSize
        if status is not None:
            existing_business.status = status

        # Save the updated business
        await db.engine.save(existing_business)

        # Return success response
        return {
            "status": "success",
            "message": "Business updated successfully",
            "business": {
                "title": existing_business.title,
                "description": existing_business.description,
                "logo": existing_business.logo,
                "fundSize": existing_business.fundSize,
                "status": existing_business.status,
                "roi": existing_business.roi,
                "price": existing_business.price,
            },
        }

    except Exception as e:
        logging.error(f"Error editing business: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@users_router.delete("/me/business/{business_id}", response_model=dict)
async def delete_business(
    business_id: str,
    current_user: User = Depends(get_current_user),
):
    try:
        # Validate user
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Find the existing business by ID
        existing_business = await db.engine.find_one(
            Bussiness, Bussiness.id == ObjectId(business_id)
        )
        if not existing_business:
            raise HTTPException(status_code=404, detail="Business not found")


        # Delete the business
        await db.engine.delete(existing_business)

        # Return success response
        return {
            "status": "success",
            "message": "Business deleted successfully",
        }

    except Exception as e:
        logging.error(f"Error deleting business: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


# Endpoint to get business
@users_router.get("/me/business", response_model=List[Bussiness])
async def get_business(
    current_user: User = Depends(get_current_user),
):
    try:
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Query all affiliate links for the current user
        businesses = await db.engine.find(Bussiness)
        return businesses
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@users_router.put("/me/password")
async def update_current_user_password(
    password_update: PasswordUpdate, current_user: User = Depends(get_current_user)
):
    # Verify current password
    if not await verify_current_password(
        current_user.email, password_update.current_password
    ):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # Update to new password
    success = await update_user_password(
        current_user.email, password_update.new_password
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update password")

    # Log password change activity
    # await log_user_activity(current_user.username, "password_change")

    return {"message": "Password updated successfully"}


@users_router.get("/me/details", response_model=UserDetails)
async def get_current_user_details(
    current_user: User = Depends(get_current_active_user),
):
    # Get user profile
    profile = await get_user_profile(current_user.email)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    # Get stats and activity
    stats = await get_user_stats(current_user.username)
    recent_activity = await get_user_recent_activity(current_user.username)

    # Return combined data
    return UserDetails(profile=profile, stats=stats, recent_activity=recent_activity)


@users_router.post("/me/activity")
async def create_user_activity(
    activity_type: str,
    details: dict = None,
    current_user: User = Depends(get_current_active_user),
):
    # Log the user activity
    await log_user_activity(current_user.username, activity_type, details)
    return {"message": "Activity logged successfully"}


@users_router.post("/me/save-account-details")
async def save_account_details(
    account_details: AccountDetails, current_user: dict = Depends(get_current_user)
):
    try:
        # Retrieve user from the database
        user = await db.engine.find_one(User, User.email == current_user.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Create a payment method in Stripe
        payment_method = stripe.PaymentMethod.create(
            type="sepa_debit",  # Use "card" if handling cards
            sepa_debit={
                "iban": account_details.iban,
            },
            billing_details={
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "address": {
                    "line1": account_details.address,
                    "country": "DE",
                },
            },
        )

        # Attach the payment method to the customer
        stripe.PaymentMethod.attach(
            payment_method.id,
            customer=user.customer_id,  
        )

        # Set it as the default payment method
        stripe.Customer.modify(
            user.customer_id,
            invoice_settings={"default_payment_method": payment_method.id},
        )

        # Save the payment method ID in the database
        user.payment_method_id = payment_method.id
        await db.engine.save(user)

        return {"status": "success", "message": "Payment method saved"}

    except stripe.error.StripeError as e:
        logging.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@users_router.post("/me/withdraw")
async def withdraw_funds(
    withDrawData: WithDraw, current_user: dict = Depends(get_current_user)
):
    try:
        # Retrieve the user from the database
        user = await db.engine.find_one(User, User.email == current_user.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if the user has a payment method saved
        if not user.payment_method_id:
            raise HTTPException(
                status_code=400, detail="No payment method saved for the user"
            )

        # Check user's available balance (Assuming you track this in your DB)
        if user.balance < withDrawData.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        # Convert amount to cents (Stripe uses smallest currency unit)
        amount_in_cents = int(withDrawData.amount * 100)

        account = stripe.Account.retrieve(user.stripe_account_id)

        if account.capabilities.get("transfers") != "active":
            account_links = stripe.AccountLink.create(
                account=account.id,
                refresh_url="https://capitalkv.com/dashboard/profile",
                return_url="https://capitalkv.com/dashboard/profile",
                type="account_onboarding",
            )
            return {"url": account_links.url, "requireOnboarding": True}

        # Check platform account's available balance
        platform_balance = stripe.Balance.retrieve()
        if platform_balance.available[0].amount < amount_in_cents:
            raise HTTPException(
                status_code=400,
                detail="Insufficient funds in platform account to process the transfer. please try again later",
            )

        stripe.Transfer.create(
            amount=1000,  # Amount in cents (€10)
            currency="eur",
            destination=user.stripe_account_id,
        )

        # Deduct the amount from user's balance
        user.balance -= withDrawData.amount
        await db.engine.save(user)

        return {
            "status": "success",
            "message": "Withdrawal processed successfully",
            "amount": withDrawData.amount,
        }

    except stripe.error.StripeError as e:
        logging.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


# API to get all affiliate links
@users_router.get("/me/affiliate-links")
async def get_all_affiliate_links(current_user=Depends(get_current_user)):
    try:
        # Query all affiliate links for the current user
        affiliate_links = await db.engine.find(
            AffliliateLinks, AffliliateLinks.userId == current_user.id
        )
        return affiliate_links
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


# API to update an affiliate link
@users_router.put("/me/affiliate-links/{affiliate_id}")
async def update_affiliate_link(
    affiliate_id: str, data: AffiliateLinkUpdate, current_user=Depends(get_current_user)
):
    print(affiliate_id)
    print(data)
    try:
        # Find the affiliate link by ID and userId
        affiliate_link = await db.engine.find_one(
            AffliliateLinks, (AffliliateLinks.id == ObjectId(affiliate_id))
        )
        if not affiliate_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate link not found"
            )

        # Update the affiliate link
        affiliate_link.name = data.name
        affiliate_link.affiliate_link = data.affiliate_link
        updated_link = await db.engine.save(affiliate_link)
        return updated_link
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

# API to delete an affiliate link
@users_router.delete("/me/affiliate-links/{affiliate_id}")
async def delete_affiliate_link(
    affiliate_id: str, current_user=Depends(get_current_user)
):
    try:
        # Find and delete the affiliate link by ID and userId
        affiliate_link = await db.engine.find_one(
            AffliliateLinks, (AffliliateLinks.id == ObjectId(affiliate_id))
        )
        if not affiliate_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate link not found"
            )

        await db.engine.delete(affiliate_link)
        return {"message": "Affiliate link deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
        

@users_router.post("/me/avatar/{user_id}", response_model=Avatar)
async def upload_avatar(user_id: str, avatar: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        existing_user = await db.engine.find_one(User, User.email == current_user.email)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User profile not found")

        image_filename = db.engine.save(avatar) #use the util function
        avatar_url = str(image_filename)

        update_user_db(user_id, {"avatar_url": avatar_url})
        return {"avatar_url": avatar_url}
    except HTTPException:
        raise #re-raise HTTPException so that it will be handled by fastapi
    except Exception as e:
        logger.error(f"Error uploading avatar: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error uploading avatar: {e}")


@users_router.delete("/me/avatar/", response_model=Avatar)
async def delete_avatar(current_user: User = Depends(get_current_user)):
    print("Current User:",current_user)
    try:
        user = await db.engine.find_one(User, User.id == ObjectId(current_user.id)) #Use the correct id and use async.
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

        if user.profile_picture_url:
            try:
                delete_image(user.profile_picture_url)  # Use util function
                logging.info(f"Profile picture {user.profile_picture_url} deleted successfully")
                user.profile_picture_url = None
                await db.engine.save(user) #Use async and update the user directly.
            except Exception as image_err:
                logging.error(f"Error deleting profile picture {user.profile_picture_url}: {image_err}")
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting profile picture")

            return {"updated_user": user}
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile picture not found")
    except Exception as e:
        logging.error(f"Error deleting avatar: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error deleting avatar: {e}")


@users_router.put("/me/avatar/{user_id}", response_model=Avatar)
async def edit_avatar(user_id: str, avatar: UploadFile = File(None), current_user: User = Depends(get_current_user)):
    try:
        # Validate that the user_id from the path matches the current user's ID
        if str(current_user.id) != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

        user = await db.engine.find_one(User, User.id == ObjectId(user_id))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

        existing_avatar = user.avatar_url
        if avatar:
            image_filename = update_image(avatar, existing_avatar)  # Use util function
            await db.engine.update(user, {"avatar_url": image_filename})
            logging.info(f"Avatar for user {user_id} updated successfully")
            return {"avatar_url": image_filename}
        else:
            # If no new avatar is provided, return the existing one
            return {"avatar_url": existing_avatar}

    except bson_errors.InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error editing avatar: {traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error editing avatar: {e}")
   
@users_router.get("/me/avatar/{user_id}")
async def get_avatar(user_id: str, current_user: User = Depends(get_current_user)):
    try:
        # ... your existing code ...

        if user.avatar_url:
            logging.info(f"Avatar URL from database: {user.avatar_url}")
            avatar_file_path = get_image_path(user.avatar_url)
            logging.info(f"Constructed avatar file path: {avatar_file_path}")

            if avatar_file_path and os.path.exists(avatar_file_path):
                logging.info(f"Avatar file found at path: {avatar_file_path}")
                return FileResponse(avatar_file_path)
            else:
                logging.warning(f"Avatar file not found at path: {avatar_file_path}")
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar file not found")
        else:
            logging.warning(f"Avatar not found for user_id: {user_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar not found for user")

    except Exception as e:
        logging.error(f"Error getting avatar: {traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error getting avatar: {e}")

def get_image_path(avatar_url: str) -> Optional[str]:
    full_path = UPLOAD_FOLDER / avatar_url
    logging.info(f"get_image_path called with avatar_url: {avatar_url}, returning: {full_path}")
    if os.path.exists(full_path):
        return str(full_path)
    return None
