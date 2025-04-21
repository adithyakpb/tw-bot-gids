import React from 'react';
import Message from './Message';

const MessageList = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="empty-chat">
        <div className="empty-chat-icon">
          <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="empty-chat-title">No messages yet</h3>
        <p className="empty-chat-subtitle">Start a conversation with the AI assistant</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <React.Fragment key={message.id}>
          <Message message={message} />
          
          {/* Add date separator if needed */}
          {index < messages.length - 1 && 
            new Date(message.timestamp).toDateString() !== new Date(messages[index + 1].timestamp).toDateString() && (
            <div className="date-separator">
              <span>{new Date(messages[index + 1].timestamp).toLocaleDateString()}</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageList;
