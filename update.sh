#!/bin/bash

set -e  # Exit on any error
set -x  # Print commands and their arguments as they are executed

# Directories
BASE_DIR="/home/git-runner/capitalkv/actions-runner/_work/CapitalKV-AI/CapitalKV-AI"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

# Logging
LOG_FILE="$BASE_DIR/deployment.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "Deployment started at $(date)"
# Restart backend service
sudo systemctl stop capitalkv-backend.service || { echo "Failed to stop backend service"; exit 1; }
sudo systemctl stop python-cnkav-backend || { echo "Failed to stop backend service"; exit 1; }
sudo systemctl stop capitalkv-frontend.service || { echo "Failed to restart frontend service"; exit 1; }


# === Backend Deployment ===
echo "Updating backend..."
cd $BACKEND_DIR || { echo "Failed to change directory to $BACKEND_DIR"; exit 1; }

# Create and activate virtual environment
if [ -f "venv/bin/activate" ]; then
  source venv/bin/activate
else
  echo "Virtual environment not found. Creating one..."
  python3 -m venv venv
  source venv/bin/activate
fi

# Install Python dependencies
pip install --upgrade pip || { echo "Failed to upgrade pip"; exit 1; }
pip install -r requirements.txt || { echo "Failed to install backend dependencies"; exit 1; }

# Restart backend service
sudo systemctl restart capitalkv-backend.service || { echo "Failed to restart backend service"; exit 1; }

echo "Backend updated successfully."

# === Frontend Deployment ===
echo "Updating frontend..."
cd $FRONTEND_DIR || { echo "Failed to change directory to $FRONTEND_DIR"; exit 1; }

# Install Node.js dependencies
npm install || { echo "Failed to install frontend dependencies"; exit 1; }

# Restart frontend service
sudo systemctl restart capitalkv-frontend.service || { echo "Failed to restart frontend service"; exit 1; }
echo "Frontend updated successfully."

sudo systemctl start python-cnkav-backend || { echo "Failed to start backend service"; exit 1; }

echo "backend of cnvav updated successfully."

# === Restart Nginx ===
echo "Restarting Nginx..."
sudo systemctl restart nginx || { echo "Failed to restart Nginx"; exit 1; }

echo "Nginx restarted successfully."

# Deployment complete
echo "Deployment completed at $(date)"
