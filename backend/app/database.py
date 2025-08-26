import logging
from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from app.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    engine: AIOEngine = None
    db = None # Add this line to hold the database object

    @classmethod
    async def connect_db(cls):
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_url)
            cls.engine = AIOEngine(client=cls.client, database=settings.database_name)
            cls.db = cls.client[settings.database_name] # Assign the database object
            await cls.client.admin.command('ping')
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")

    def __getattr__(self, name):
        # Delegate attribute access to the motor database object
        if self.db is not None:
            return getattr(self.db, name)
        raise AttributeError("'Database' object has no attribute 'db' or it's not connected")

db = Database()