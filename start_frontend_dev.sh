#!/bin/bash

# Navigate to the Next.js frontend directory
cd /www/wwwroot/CapitalKV-ALL/frontend || exit

# Kill all existing PM2 processes and clear the PM2 list
echo "Killing all PM2 processes and clearing the process list..."
pm2 kill

# Remove old PM2 dump file to avoid mismatches
echo "Removing old PM2 dump file..."
rm -f ~/.pm2/dump.pm2

# Install PM2 globally using Yarn (if not already installed)
echo "Installing PM2 globally with Yarn..."
yarn global add pm2

# Ensure Yarn's global bin directory is in PATH
export PATH="$(yarn global bin):$PATH"

# Install dependencies for the project
echo "Installing dependencies..."
yarn install

# Start the Next.js application in development mode using PM2
echo "Starting the application in development mode with PM2..."
pm2 start yarn --name "CapitalKV-Frontend" -- dev

# Save the new PM2 process list to restart on reboot
echo "Saving PM2 process list..."
pm2 save

# Set PM2 to start on server reboot
echo "Setting up PM2 to start on server reboot..."
pm2 startup systemd --silent

# Enable PM2 startup service
systemctl enable pm2-root

echo "PM2 setup complete. Application is now running in development mode."



