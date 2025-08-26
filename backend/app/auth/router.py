## New code for login and register
import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.auth.utils import (
    create_access_token,
    get_user,
    authenticate_user,
    pwd_context,
    send_reset_password_email,
)
from app.auth.utils import (
    create_refresh_token,
    validate_refresh_token,
    revoke_refresh_token,
    store_refresh_token,
)
from app.users.models import User
from app.database import db  # Import the Odmantic ODM engine from the Database instance
from app.auth.models import (
    Token,
    PasswordResetToken,
    NewPassword,
    TokenWithRefreshToken,
    Email,
)

from app.users.models import (
    AffliliateLinks,
    AffiliateLinkCreate,
)
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Dict
from app.config import settings
from app.payments.utils import generate_customer_id


import stripe

stripe.api_key = settings.stripe_api_key
auth_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
ALGORITHM = os.getenv("algorithm", None)
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("access_token_expire_minutes", None)
SECRET_KEY = os.getenv("secret_key", None)


# Request model
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    is_admin_user: bool = False
    password: str


class RegisterAdminRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


from typing import List


@auth_router.post("/register", response_model=Token)
async def register(request: RegisterRequest):
    # Check if the user already exists
    user = await db.engine.find_one(User, User.email == request.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered."
        )

    # Hash the user's password
    hashed_password = pwd_context.hash(request.password)

    # Create a Stripe connected account
    connected_account = stripe.Account.create(
        type="express",  # or "custom"
        country="DE",  # User's country
        email=request.email,
        business_type="individual",  # This tells Stripe it's a normal user, not a business
        capabilities={
            "transfers": {"requested": True},
            "card_payments": {"requested": True},
        },
    )

    # Save the new user in the database
    new_user = User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        subscription="free_trial",
        stripe_account_id=connected_account.id,
        created_at=datetime.utcnow(),
    )
    await db.engine.save(new_user)
    customer_id = await generate_customer_id(request.email)

    # Define affiliate link details
    affiliate_data = [
        # {
        #     "name": "Workplace Subscription",
        #     "subscription": "prod_RWDzYdWLLkARY9",
        # },
        {
            "name": "CapitalKV+",
            "subscription": "prod_RWDyf3WuIGQdJC",
        },
        {
            "name": "CapitalKV Exclusive",
            "subscription": "prod_RWDx47OJ4leC9N",
        },
    ]

    # Generate and save affiliate links
    affiliate_links = [
        AffliliateLinks(
            userId=new_user.id,
            affiliate_link=f"https://capitalkv.com/affiliate/{new_user.id}/{data['subscription']}/{new_user.username}",
            created_at=datetime.utcnow(),
            name=data["name"],
        )
        for data in affiliate_data
    ]

    # Save all affiliate links in one go
    await db.engine.save_all(affiliate_links)

    # Generate and return the access token
    access_token = create_access_token(data={"sub": new_user.email})
    return Token(access_token=access_token, token_type="bearer")


@auth_router.post("/register-admin", response_model=Token)
async def registerAdmin(request: RegisterRequest):
    # Check if the user already exists
    user = await db.engine.find_one(User, User.email == request.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered."
        )

    # Hash the user's password
    hashed_password = pwd_context.hash(request.password)

    # Create a Stripe connected account
    connected_account = stripe.Account.create(
        type="express",  # or "custom"
        country="DE",  # User's country
        email=request.email,
        capabilities={"transfers": {"requested": True}},
    )

    # Save the new user in the database
    new_user = User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        is_admin_user=True,
        subscription="free_trial",
        stripe_account_id=connected_account.id,
        created_at=datetime.utcnow(),
    )
    await db.engine.save(new_user)
    customer_id = await generate_customer_id(request.email)

    # Define affiliate link details
    affiliate_data = [
        # {
        #     "name": "Workplace Subscription",
        #     "subscription": "prod_RWDzYdWLLkARY9",
        # },
        {
            "name": "CapitalKV+",
            "subscription": "prod_RWDyf3WuIGQdJC",
        },
        {
            "name": "CapitalKV Exclusive",
            "subscription": "prod_RWDx47OJ4leC9N",
        },
    ]

    # Generate and save affiliate links
    affiliate_links = [
        AffliliateLinks(
            userId=new_user.id,
            affiliate_link=f"https://capitalkv.com/affiliate/{new_user.id}/{data['subscription']}/{new_user.username}",
            created_at=datetime.utcnow(),
            name=data["name"],
        )
        for data in affiliate_data
    ]

    # Save all affiliate links in one go
    await db.engine.save_all(affiliate_links)

    # Generate and return the access token
    access_token = create_access_token(data={"sub": new_user.email})
    return Token(access_token=access_token, token_type="bearer")


# Login to get tokens
@auth_router.post("/login", response_model=TokenWithRefreshToken)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    await store_refresh_token(refresh_token, user.email)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# Logout by revoking the refresh token
@auth_router.post("/logout")
async def logout(refresh_token: str):
    await revoke_refresh_token(refresh_token)
    return {"detail": "Successfully logged out"}


@auth_router.post(
    "/forgot-password", status_code=status.HTTP_200_OK, response_model=Dict[str, str]
)
async def forgot_password(form_data: Email):
    user = await get_user(form_data.email)
    if not user:
        # Return 404 if the user is not found
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with the provided email address does not exist.",
        )

    try:
        # Send Reset Password Email
        await send_reset_password_email(
            user_email=form_data.email,
            user_name=user.username,
            user_password=user.hashed_password,
        )
        return {"message": "We send an email to your mail address."}
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your request: {str(e)}",
        )


# Refresh access token
@auth_router.post("/refresh", response_model=Token)
async def refresh(refresh_token: str):
    user_email = await validate_refresh_token(refresh_token)
    access_token = create_access_token(data={"sub": user_email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# Password Reset: Update the user's password
@auth_router.post("/password-reset")
async def password_reset(new_password: NewPassword):
    try:
        # Decode the token
        payload = jwt.decode(new_password.token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract information from the payload
        user_email = payload.get("user_email")
        token_expiration = payload.get("exp")

        if not user_email or not token_expiration:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token payload"
            )

        # Check if the token has expired
        if datetime.utcnow().timestamp() > token_expiration:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Token has expired"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token"
        )

    # Retrieve the user by email
    existing_user = await db.engine.find_one(User, User.email == user_email)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Hash the new password
    hashed_password = pwd_context.hash(new_password.new_password)

    # Update the user's password
    existing_user.hashed_password = hashed_password
    await db.engine.save(existing_user)

    return {"message": "Password has been reset successfully"}
