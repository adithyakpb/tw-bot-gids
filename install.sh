#!/bin/bash

echo "Installing dependencies for ThoughtWorks LLM Chatbot..."

# Create data directory for MongoDB if it doesn't exist
if [ ! -d "data/db" ]; then
    echo "Creating MongoDB data directory..."
    mkdir -p data/db
fi

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "Dependencies installed successfully!"
echo "You can now run the application using ./start.sh"
echo "Make sure MongoDB and LM Studio are running before starting the application."
echo "You can check the status of these services using ./check-services.sh"
