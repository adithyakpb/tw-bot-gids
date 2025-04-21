import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Message = ({ message }) => {
  const { role, content, timestamp, metadata } = message;
  const isUser = role === 'user';
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || {});
  const [copied, setCopied] = useState(false);
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // Format the timestamp
  const formattedTime = timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : '';
  
  // Handle reactions
  const handleReaction = (emoji) => {
    const newReactions = { ...reactions };
    if (newReactions[emoji]) {
      newReactions[emoji]++;
    } else {
      newReactions[emoji] = 1;
    }
    setReactions(newReactions);
    // Here you would typically send this to the server
  };
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Custom renderer for code blocks
  const components = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={isDarkMode ? vscDarkPlus : vs}
          language={match[1]}
          PreTag="div"
          className="rounded-md"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded`} {...props}>
          {children}
        </code>
      );
    }
  };
  
  return (
    <div 
      className={`message-wrapper ${isUser ? 'user-message-wrapper' : 'assistant-message-wrapper'}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {!isUser && (
        <div className="avatar assistant-avatar">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11.5C9 12.8807 7.88071 14 6.5 14C5.11929 14 4 12.8807 4 11.5C4 10.1193 5.11929 9 6.5 9C7.88071 9 9 10.1193 9 11.5Z" fill="currentColor"/>
            <path d="M20 11.5C20 12.8807 18.8807 14 17.5 14C16.1193 14 15 12.8807 15 11.5C15 10.1193 16.1193 9 17.5 9C18.8807 9 20 10.1193 20 11.5Z" fill="currentColor"/>
            <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 16.5C9 16.5 10 18 12 18C14 18 15 16.5 15 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 7L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 7L4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      
      <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
        <div className="message-content">
          <ReactMarkdown components={components}>
            {content}
          </ReactMarkdown>
        </div>
        
        <div className="message-footer">
          <span className="message-time">{formattedTime}</span>
          
          {metadata && (
            <div className="message-metadata">
              {metadata.tokensUsed && (
                <span className="metadata-item tokens">
                  {metadata.tokensUsed.total} tokens
                </span>
              )}
              
              {metadata.processingTime && (
                <span className="metadata-item processing-time">
                  {(metadata.processingTime / 1000).toFixed(2)}s
                </span>
              )}
              
              {metadata.model && (
                <span className="metadata-item model">
                  {metadata.model}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Message reactions display */}
        {Object.keys(reactions).length > 0 && (
          <div className="message-reactions">
            {Object.entries(reactions).map(([emoji, count]) => (
              <span key={emoji} className="reaction">
                {emoji} <span className="reaction-count">{count}</span>
              </span>
            ))}
          </div>
        )}
        
        {/* Message actions */}
        {showReactions && (
          <div className={`message-actions ${isUser ? 'user-actions' : 'assistant-actions'}`}>
            <button 
              className="message-action-btn"
              onClick={copyToClipboard}
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {copied ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                </svg>
              )}
            </button>
            
            <div className="reaction-buttons">
              <button 
                className="message-action-btn reaction-btn"
                onClick={() => handleReaction('👍')}
                title="Like"
              >
                👍
              </button>
              <button 
                className="message-action-btn reaction-btn"
                onClick={() => handleReaction('❤️')}
                title="Love"
              >
                ❤️
              </button>
              <button 
                className="message-action-btn reaction-btn"
                onClick={() => handleReaction('🎉')}
                title="Celebrate"
              >
                🎉
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="avatar user-avatar">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="currentColor"/>
            <path d="M12 13C7.58172 13 4 16.5817 4 21H20C20 16.5817 16.4183 13 12 13Z" fill="currentColor"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default Message;
