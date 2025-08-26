from odmantic import Model
from datetime import datetime

class SupportGeneralMessage(Model):
    user_id: str
    message: str
    created_at: datetime