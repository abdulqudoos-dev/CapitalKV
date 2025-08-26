from fastapi import FastAPI
from app.database import db
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import auth_router
from app.users.router import users_router
from app.contact.router import contact_router
from app.support.general.router import support_general_router
from app.support.billing.router import support_billing_router
from app.campaigns.router import router as campaigns_router
from app.integrations.router import router as integrations_router
from app.payments.router import payment_router
from app.chat.router import chat_router
from app.blog.router import blog_post_router
from app.ecommerce.router import ecommerce_router
from app.notifications.router import notifications_router
from app.gamification.router import gamification_router
from app.assistant.router import assistant_router
from app.apps.router import apps_router
import logging
from colorlog import ColoredFormatter
import os
from fastapi.staticfiles import StaticFiles
import uvicorn 

#load_dotenv()

app = FastAPI()
 
# Mount the 'static' directory to serve static files from /static path
static_dir = "static"
# The ecommerce router already creates the 'static/uploads' directory, 
# but we can ensure the base 'static' dir exists.
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Configure logging with colored formatter
logging.basicConfig(level=logging.INFO)
formatter = ColoredFormatter(
    "%(log_color)s%(levelname)s:%(name)s:%(message)s",
    datefmt=None,
    reset=True,
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'yellow',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
)
logging.getLogger().handlers[0].setFormatter(formatter)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await db.connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close_db()

app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(contact_router, prefix="/contact")
app.include_router(support_general_router, prefix="/support/general")
app.include_router(support_billing_router, prefix="/support/billing")
app.include_router(campaigns_router, prefix="/campaigns", tags=["campaigns"])
app.include_router(integrations_router, prefix="/integrations", tags=["integrations"])
app.include_router(payment_router, prefix="/payments", tags=["payments"])
app.include_router(chat_router, prefix="/chats")
app.include_router(blog_post_router)
app.include_router(ecommerce_router, prefix="/ecommerce")
app.include_router(gamification_router, prefix="/gamification")
app.include_router(notifications_router, prefix="/notifications")
app.include_router(assistant_router, prefix="/assistant", tags=["assistants"])
app.include_router(apps_router)


@app.get("/")
async def root():
    return {"message": "Welcome to the AI-Driven Automated Platform"}

if __name__ == "__main__":
    uvicorn.run(
        app="app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
