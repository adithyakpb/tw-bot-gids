import React, { useState } from 'react';

const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  selectedModel, 
  setSelectedModel, 
  availableModels,
  darkMode,
  setDarkMode,
  isMobile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('models');
  
  // Filter models based on search term
  const filteredModels = availableModels.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle model selection
  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  // If sidebar is closed and not mobile, return a minimal sidebar
  if (!isOpen) {
    return (
      <div className="sidebar-collapsed">
        <button 
          className="sidebar-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    );
  }
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Models & Settings</h2>
        <div className="sidebar-header-actions">
          <button 
            className="menu-button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <button 
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          Models
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {activeTab === 'models' && (
        <div className="sidebar-content">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
          
          <div className="models-list">
            {filteredModels.length > 0 ? (
              filteredModels.map(model => (
                <button
                  key={model.id}
                  className={`model-item ${selectedModel === model.id ? 'selected' : ''}`}
                  onClick={() => handleModelSelect(model.id)}
                >
                  <div className="model-info">
                    <span className="model-name">{model.name}</span>
                  </div>
                  {selectedModel === model.id && (
                    <svg className="w-5 h-5 check-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="no-results">
                <p>No models found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="sidebar-content">
          <div className="settings-list">
            <div className="setting-item">
              <span>Dark Mode</span>
              <button 
                className={`toggle-switch ${darkMode ? 'on' : 'off'}`}
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Disable dark mode' : 'Enable dark mode'}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
            
            <div className="setting-item">
              <span>Current Model</span>
              <span className="setting-value">{availableModels.find(m => m.id === selectedModel)?.name || 'None selected'}</span>
            </div>
            
            <div className="setting-item">
              <span>Version</span>
              <span className="setting-value">1.0.0</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="sidebar-footer">
        <p>ThoughtWorks LLM Chatbot</p>
      </div>
    </aside>
  );
};

export default Sidebar;
