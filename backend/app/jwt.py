from datetime import timedelta, datetime
from dotenv import load_dotenv
import os

from typing import Annotated
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from starlette import status

from app.db.database import user_collection
from loguru import logger

load_dotenv()

ALGORITHM = os.getenv('algorithm', None)
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv('access_token_expire_minutes', None)
SECRET_KEY = os.getenv('secret_key', None)

oauth_bearer = OAuth2PasswordBearer(tokenUrl="auth/login")

if ALGORITHM is None or ACCESS_TOKEN_EXPIRE_MINUTES is None:
    raise Exception('Missing token env variables')

ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES)


def create_access_token(data: dict, expire_delta: timedelta):
    """
        Create a JWT token.

        Args:
            data (dict): The data to encode in the JWT token.
            expire_delta (timedelta, optional): The expiration delta for the token.

        Returns:
            str: The encoded JWT token.
    """
    to_encode = data.copy()
    if expire_delta:
        expire = datetime.utcnow() + expire_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str, token_type: str):
    """
      Verify a JWT token.

      Args:
          token (str): The JWT token to verify.
          token_type (str): The type of token (e.g., "access", "refresh").

      Returns:
          str: The email extracted from the JWT token.

      Raises:
          HTTPException: If the token is invalid.
      """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid {token_type} token"
            )
        logger.info(f"email {email} verified")
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid {token_type} token"
        )


async def get_current_user(access_token: Annotated[str, Depends(oauth_bearer)], token_type: str = None):
    """
        Get the current user from the JWT token.

        Args:
            access_token (str): The JWT token for the current user.
            token_type (str, optional): The type of token (default is "access").

        Returns:
            dict: The user data extracted from the database.

        Raises:
            HTTPException: If the user cannot be validated or an internal error occurs.
    """
    try:
        email = verify_access_token(access_token, token_type)
      
        user = await user_collection.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user.")
        return user
    except Exception as e:
        logger.info(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


user_dependency = Annotated[dict, Depends(get_current_user)]
