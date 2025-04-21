# ThoughtWorks LLM Chatbot

A modern chatbot application powered by LLMs hosted on LM Studio, with a JavaScript backend and frontend.

## Features

- Modern React frontend with Vite
- Node.js/Express backend
- LM Studio integration for LLM hosting
- MongoDB logging of messages with detailed metrics
- ThoughtWorks-themed UI with custom color scheme
- Responsive design for all devices

## Tech Stack

### Frontend
- React with hooks
- Vite for fast builds
- TailwindCSS for styling
- React Query for data fetching
- Bitter font from Google Fonts

### Backend
- Node.js with Express
- MongoDB for message logging
- LM Studio API integration

## Prerequisites

- Node.js (v14+)
- MongoDB (local instance)
- LM Studio running locally

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd tw-llm-chatbot
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Set up MongoDB

Make sure MongoDB is running locally. The application will connect to a database named `tw_gids_db`.

```bash
# Start MongoDB (if not running as a service)
mongod --dbpath=/path/to/data/db
```

### 4. Set up LM Studio

1. Download and install LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/)
2. Launch LM Studio and load a model
3. Start the local server in LM Studio (it should run on http://localhost:1234 by default)

### 5. Environment Configuration

Create a `.env` file in the backend directory with the following content:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tw_gids_db
LM_STUDIO_API_URL=http://localhost:1234/v1
```

Adjust the values as needed for your environment.

### 6. Start the application

```bash
# Start both backend and frontend in development mode
npm run dev

# Or start them separately:
# Start backend
npm run server

# Start frontend
npm run client
```

## Usage

1. Open your browser and navigate to `http://localhost:5173` (Vite's default port)
2. Start chatting with the AI assistant
3. Use the model selector in the header to switch between different LLM models
4. Toggle dark mode using the sun/moon icon

## Database Schema

### Message Logs Collection

```javascript
{
  _id: ObjectId,
  sessionId: String,          // To group messages in a conversation
  timestamp: Date,            // When the message was sent/received
  role: String,               // 'user' or 'assistant'
  content: String,            // The actual message content
  
  // LLM Metrics
  model: String,              // Model name used for generation
  tokensUsed: {
    prompt: Number,           // Tokens in the prompt
    completion: Number,       // Tokens in the completion
    total: Number             // Total tokens used
  },
  
  // Performance Metrics
  processingTime: Number,     // Time taken to generate response (ms)
  
  // Additional Metadata
  metadata: {
    userAgent: String,        // Client information
    ipAddress: String,        // User's IP (anonymized if needed)
    settings: Object          // Any custom settings used for this message
  }
}
```

### Session Collection

```javascript
{
  _id: ObjectId,
  startTime: Date,
  endTime: Date,
  userIdentifier: String,     // Anonymous ID or user ID if authenticated
  totalMessages: Number,
  totalTokensUsed: Number,
  active: Boolean,
  metadata: {
    userAgent: String,
    ipAddress: String,
    browser: String,
    os: String
  }
}
```

## API Endpoints

### Models
- `GET /api/chat/models` - Get available LLM models

### Sessions
- `POST /api/chat/sessions` - Create a new chat session
- `PUT /api/chat/sessions/:sessionId/end` - End a chat session
- `GET /api/chat/sessions/:sessionId/stats` - Get session statistics
- `GET /api/chat/sessions/:sessionId/messages` - Get messages for a session

### Messages
- `POST /api/chat/messages` - Send a message and get a response

## License

MIT
