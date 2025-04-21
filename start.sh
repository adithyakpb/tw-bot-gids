#!/bin/bash

# Start MongoDB if it's not already running
echo "Checking if MongoDB is running..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --dbpath=./data/db --fork --logpath=./data/mongod.log
    if [ $? -ne 0 ]; then
        echo "Failed to start MongoDB. Please make sure it's installed and the data directory exists."
        echo "You may need to run: mkdir -p ./data/db"
        exit 1
    fi
    echo "MongoDB started."
else
    echo "MongoDB is already running."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start the application in development mode
echo "Starting the application..."
npm run dev
