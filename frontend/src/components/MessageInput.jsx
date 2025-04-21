import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, disabled, selectedModel }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <div className={`message-input-wrapper ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
        <textarea
          ref={textareaRef}
          className="message-textarea"
          placeholder={disabled ? "Waiting for response..." : `Message ${selectedModel || 'AI'}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows="1"
          disabled={disabled}
        />
        
        <div className="message-actions">
          <button
            type="button"
            className="action-button"
            aria-label="Attach file"
            disabled={disabled}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </button>
          
          <button
            type="submit"
            className={`send-button ${!message.trim() || disabled ? 'disabled' : ''}`}
            disabled={!message.trim() || disabled}
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="input-footer">
        <span className="input-hint">Press Shift + Enter for new line</span>
        <span className={`character-count ${message.length > 1000 ? 'limit-near' : ''} ${message.length > 1500 ? 'limit-reached' : ''}`}>
          {message.length}/2000
        </span>
      </div>
    </form>
  );
};

export default MessageInput;
