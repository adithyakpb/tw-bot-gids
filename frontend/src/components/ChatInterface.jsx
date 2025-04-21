import { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { v4 as uuidv4 } from 'uuid';

const ChatInterface = ({ selectedModel }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Create a new session when the component mounts or selectedModel changes
  useEffect(() => {
    const createSession = async () => {
      try {
        setLoading(true);
        // Create a session via API
        const response = await fetch('http://localhost:5001/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIdentifier: 'anonymous',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const data = await response.json();
        const newSessionId = data._id;
        setSessionId(newSessionId);
        
        // Add a welcome message
        setMessages([
          {
            id: uuidv4(),
            role: 'assistant',
            content: 'Hello! I\'m your ThoughtWorks AI assistant. How can I help you today?',
            timestamp: new Date(),
          }
        ]);
        setLoading(false);
      } catch (err) {
        // Fallback to local session ID if API fails
        console.error('Error creating session:', err);
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        
        setMessages([
          {
            id: uuidv4(),
            role: 'assistant',
            content: 'Hello! I\'m your ThoughtWorks AI assistant. How can I help you today?',
            timestamp: new Date(),
          }
        ]);
        setLoading(false);
      }
    };
    
    createSession();
  }, [selectedModel]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || !sessionId) return;
    
    // Add user message to the list
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    // Show typing indicator
    setTimeout(() => {
      setIsTyping(true);
    }, 500);
    
    try {
      // Try to use the API
      try {
        const response = await fetch('http://localhost:5001/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            message,
            model: selectedModel,
            settings: {
              temperature: 0.7,
              max_tokens: 1000
            }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        setIsTyping(false);
        
        const botResponse = {
          id: uuidv4(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: {
            tokensUsed: data.tokensUsed,
            processingTime: data.processingTime,
            model: data.model,
          },
        };
        
        setMessages(prev => [...prev, botResponse]);
        setLoading(false);
      } catch (apiError) {
        console.error('API error:', apiError);
        // Fallback to simulated response if API fails
        setTimeout(() => {
          setIsTyping(false);
          
          const botResponse = {
            id: uuidv4(),
            role: 'assistant',
            content: `I received your message: "${message}". This is a placeholder response since we couldn't connect to the LM Studio API.`,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, botResponse]);
          setLoading(false);
        }, 1500);
      }
    } catch (err) {
      setIsTyping(false);
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    try {
      // Reset loading state
      setLoading(false);
      setIsTyping(false);
      
      // Create a new session via API
      try {
        const response = await fetch('http://localhost:5001/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIdentifier: 'anonymous',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const data = await response.json();
        const newSessionId = data._id;
        setSessionId(newSessionId);
      } catch (err) {
        // Fallback to local session ID if API fails
        console.error('Error creating session:', err);
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
      }
      
      // Reset messages
      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Conversation cleared. How can I help you today?',
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
      setError('Failed to clear conversation. Please try again.');
    }
  };

  return (
    <div className="chat-container">
      {error && (
        <div className="error-notification">
          <p>{error}</p>
          <button 
            className="close-error"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
      
        <div className="chat-header">
        <div className="model-info">
          <span className="model-label">Model: </span>
          <span className="model-name" style={{ maxWidth: '100%', overflow: 'visible', display: 'inline' }}>{selectedModel}</span>
        </div>
        
        <button 
          className="clear-chat"
          onClick={clearConversation}
          aria-label="Clear conversation"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Clear Chat
        </button>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="messages-container"
      >
        <MessageList messages={messages} />
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={loading && !isTyping} 
          selectedModel={selectedModel}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
