#!/bin/bash

# Check if MongoDB is running
echo "Checking MongoDB status..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running."
else
    echo "❌ MongoDB is not running. Start it with: mongod --dbpath=./data/db"
fi

# Check if LM Studio API is accessible
echo "Checking LM Studio API status..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:1234/v1/models > /tmp/lmstudio_status
if [ "$(cat /tmp/lmstudio_status)" == "200" ]; then
    echo "✅ LM Studio API is accessible."
else
    echo "❌ LM Studio API is not accessible. Make sure LM Studio is running with the API server enabled."
fi

# Clean up
rm -f /tmp/lmstudio_status
