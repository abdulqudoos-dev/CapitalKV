from fastapi.security import OAuth2PasswordBearer

# Define oauth2_scheme here to avoid circular imports
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
