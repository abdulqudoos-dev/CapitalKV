
# Path to the Python backend script
PYTHON_BACKEND_SCRIPT="/www/wwwroot/python_newbackend.sh"

# Path to the React web app script
REACT_WEBAPP_SCRIPT="/www/wwwroot/start_frontend_dev.sh"

# Run the Python backend script first
echo "Running Python backend setup..."
bash "$PYTHON_BACKEND_SCRIPT"

# Check if the Python backend script was successful
if [ $? -ne 0 ]; then
    echo "Python backend setup failed."
    exit 1
fi

# Run the React web app script after the Python backend is set up successfully
echo "Running React web app setup..."
bash "$REACT_WEBAPP_SCRIPT"

# Check if the React web app script was successful
if [ $? -ne 0 ]; then
    echo "React web app setup failed."
    exit 1
fi

echo "Deployment completed successfully."