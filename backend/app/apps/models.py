from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, source: type, handler):
      return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
        )

class AppBase(BaseModel):
    name: str = Field(..., description="Name of the app")
    description: str = Field(..., description="Description of the app")
    price: float = Field(..., description="Price of the app")
    category: str = Field(..., description="Category of the app")
    rating: float = Field(..., description="Average rating of the app")
    avatar: str = Field(..., description="URL or filename of the app's avatar")
    userRating: Optional[float] = Field(None, description="User's rating of the app")
    isRatingSubmitted: Optional[bool] = Field(False, description="Indicates if the user has submitted a rating")
    network: Optional[str] = Field(None, description="Network type of the app")

class AppCreate(AppBase):
    pass

class AppUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the app")
    description: Optional[str] = Field(None, description="Description of the app")
    price: Optional[float] = Field(None, description="Price of the app")
    category: Optional[str] = Field(None, description="Category of the app")
    rating: Optional[float] = Field(None, description="Average rating of the app")
    avatar: Optional[str] = Field(None, description="URL or filename of the app's avatar")
    userRating: Optional[float] = Field(None, description="User's rating of the app")
    isRatingSubmitted: Optional[bool] = Field(None, description="Indicates if the user has submitted a rating")
    network: Optional[str] = Field(None, description="Network type of the app")

class App(AppBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AppList(BaseModel):
    apps: List[App]