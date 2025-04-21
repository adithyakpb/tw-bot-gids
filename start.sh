#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if MongoDB is installed
check_mongodb() {
    if ! command_exists mongod; then
        echo "❌ MongoDB is not installed. Please install MongoDB before running this script."
        echo "Visit https://www.mongodb.com/try/download/community for installation instructions."
        exit 1
    fi
}

# Function to check if a port is in use
check_port() {
    if command_exists lsof; then
        lsof -i:$1 >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            return 0  # Port is in use
        else
            return 1  # Port is free
        fi
    elif command_exists netstat; then
        netstat -tuln | grep ":$1 " >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            return 0  # Port is in use
        else
            return 1  # Port is free
        fi
    else
        # If neither lsof nor netstat is available, try a direct connection
        (echo > /dev/tcp/localhost/$1) >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            return 0  # Port is in use
        else
            return 1  # Port is free
        fi
    fi
}

# Function to find an available port starting from a base port
find_available_port() {
    local port=$1
    while check_port $port; do
        echo "Port $port is in use, trying next port..."
        port=$((port + 1))
    done
    echo $port
}

# Check if environment file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file is missing. This file should be included in the repository."
    echo "Please check your git clone and try again."
    exit 1
else
    echo "✅ backend/.env file exists."
fi

# Check if MongoDB is installed
check_mongodb

# Create data directory for MongoDB if it doesn't exist
if [ ! -d "data/db" ]; then
    echo "Creating MongoDB data directory..."
    mkdir -p data/db
fi

# Start MongoDB if it's not already running
echo "Checking if MongoDB is running..."
if command_exists pgrep; then
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
else
    # If pgrep is not available, try starting MongoDB anyway
    echo "Starting MongoDB..."
    mongod --dbpath=./data/db --fork --logpath=./data/mongod.log
    if [ $? -ne 0 ]; then
        echo "Failed to start MongoDB. It might already be running or there's an issue with the installation."
        echo "If MongoDB is not running, please start it manually before continuing."
    else
        echo "MongoDB started."
    fi
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

# Check if LM Studio API is accessible
echo "Checking LM Studio API status..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:1234/v1/models > /tmp/lmstudio_status
if [ "$(cat /tmp/lmstudio_status)" == "200" ]; then
    echo "✅ LM Studio API is accessible."
else
    echo "⚠️ LM Studio API is not accessible. Make sure LM Studio is running with the API server enabled."
    echo "The application will still start, but chat functionality may be limited."
fi

# Clean up
rm -f /tmp/lmstudio_status

# Find available ports
BACKEND_PORT=$(find_available_port 5001)
FRONTEND_PORT=$(find_available_port 5173)

echo "Using backend port: $BACKEND_PORT"
echo "Using frontend port: $FRONTEND_PORT"

# Update backend port in server.js and .env if needed
if [ $BACKEND_PORT -ne 5001 ]; then
    echo "Updating backend port in server.js..."
    # Create a temporary file with the updated port
    cat backend/server.js | sed "s/const PORT = 5001;/const PORT = $BACKEND_PORT;/" > backend/server.js.tmp
    if [ $? -eq 0 ]; then
        # Replace the original file with the temporary file
        mv backend/server.js.tmp backend/server.js
    else
        echo "Failed to update backend port in server.js. The application may not work correctly."
        rm -f backend/server.js.tmp
    fi
    
    # Update the PORT in .env file
    echo "Updating PORT in backend/.env..."
    sed -i.bak "s/PORT=5001/PORT=$BACKEND_PORT/" backend/.env
    if [ $? -ne 0 ]; then
        # For macOS compatibility
        sed -i "" "s/PORT=5001/PORT=$BACKEND_PORT/" backend/.env
    fi
    rm -f backend/.env.bak
fi

# Display current environment variables
echo "Current environment variables:"
echo "PORT=$BACKEND_PORT"
echo "NODE_ENV=development"
echo "MONGODB_URI=mongodb://localhost:27017/tw_gids_db"
echo "LM_STUDIO_API_URL=http://localhost:1234/v1"

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js before running this script."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Start the backend server
echo "Starting backend server on port $BACKEND_PORT..."
PORT=$BACKEND_PORT npm run server &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 3

# Start the frontend
echo "Starting frontend on port $FRONTEND_PORT..."
cd frontend && PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!

# Wait a moment for the frontend to start
sleep 5

# Open the browser
echo "Opening browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:$FRONTEND_PORT"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:$FRONTEND_PORT"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "http://localhost:$FRONTEND_PORT"
else
    echo "Could not open browser automatically. Please open http://localhost:$FRONTEND_PORT in your browser."
fi

echo "Application is running!"
echo "Backend: http://localhost:$BACKEND_PORT"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Press Ctrl+C to stop the application"

# Wait for user to press Ctrl+C
trap "echo 'Stopping application...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
