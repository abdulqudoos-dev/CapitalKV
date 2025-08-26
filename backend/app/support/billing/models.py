from odmantic import Model
from datetime import datetime

class SupportBillingMessage(Model):
    user_id: str
    message: str
    created_at: datetime