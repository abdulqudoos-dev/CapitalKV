#!/bin/bash

# Variables
CLONE_DIR="/www/wwwroot/CapitalKV"  # Temporary directory for cloning
TARGET_DIR="/www/wwwroot/CapitalKV-ALL"  # Final directory for files
REPO_URL="git@github.com:cenklkavsut/CapitalKV-AI.git"  # Repository URL
BACKUP_DIR="/www/wwwroot/backupdatanew"  # Directory containing backup files
PORT=8001  # Port for the Python application

# Function to stop any process running on the specified port
stop_process_on_port() {
    echo "Checking for any process running on port $PORT..."
    PIDS=$(lsof -t -i :$PORT)
    if [ -n "$PIDS" ]; then
        echo "Stopping process(es) on port $PORT (PIDs: $PIDS)"
        for PID in $PIDS; do
            kill -9 "$PID" || { echo "Failed to stop process with PID $PID. Exiting."; exit 1; }
            echo "Stopped process with PID $PID."
        done
        echo "All processes on port $PORT stopped successfully."
    else
        echo "No process found running on port $PORT."
    fi
}

# Stop any process running on the specified port
stop_process_on_port

# Remove the existing clone directory if it exists
if [ -d "$CLONE_DIR" ]; then
    echo "Removing existing clone directory: $CLONE_DIR"
    rm -rf "$CLONE_DIR"
fi

# Create the necessary directories
mkdir -p "$CLONE_DIR" "$TARGET_DIR"

# Clone the repository
echo "Cloning repository $REPO_URL into $CLONE_DIR"
git clone "$REPO_URL" "$CLONE_DIR"
if [ $? -ne 0 ]; then
    echo "Failed to clone repository. Exiting."
    exit 1
fi

# Synchronize the contents to the target directory
echo "Syncing contents from $CLONE_DIR to $TARGET_DIR"
rsync -a --delete "$CLONE_DIR/" "$TARGET_DIR/"

# Copy the .env file from backup to the backend directory
echo "Copying .env file from $BACKUP_DIR to $TARGET_DIR/backend/app"
cp "$BACKUP_DIR/.env" "$TARGET_DIR/backend/app" || { echo "Failed to copy .env file. Exiting."; exit 1; }

# Navigate to the backend directory
cd "$TARGET_DIR/backend" || { echo "Failed to navigate to backend directory. Exiting."; exit 1; }

# Set up the Python virtual environment if not already set
if [ ! -d "venv" ]; then
    echo "Setting up Python virtual environment"
    sudo apt update
    sudo apt install -y python3.12-venv || { echo "Failed to install python3.12-venv. Exiting."; exit 1; }
    python3.12 -m venv venv || { echo "Failed to create virtual environment. Exiting."; exit 1; }
fi

# Activate the virtual environment
echo "Activating virtual environment"
source "venv/bin/activate" || { echo "Failed to activate virtual environment. Exiting."; exit 1; }

# Upgrade pip and install dependencies
echo "Upgrading pip and installing dependencies"
pip install --upgrade pip || { echo "Failed to upgrade pip. Exiting."; exit 1; }
pip install --break-system-packages -r requirements.txt || { echo "Failed to install dependencies. Exiting."; exit 1; }

# Export the PYTHONPATH if needed
export PYTHONPATH="$TARGET_DIR/backend"

# Start Uvicorn server on the specified port
echo "Starting Uvicorn server on port $PORT"
uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload &
UVICORN_PID=$!

# Disown the Uvicorn process to keep it running after the script exits
disown "$UVICORN_PID"
echo "Script completed successfully. Uvicorn is running on port $PORT."

exit 0
