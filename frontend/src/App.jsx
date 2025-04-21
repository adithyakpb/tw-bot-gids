import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

// Create a client
const queryClient = new QueryClient();

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    // Apply dark mode class to body if enabled
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    // Fetch available models
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/chat/models');
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && data.data.length > 0) {
            // Filter out embedding models
            const filteredModels = data.data.filter(model => {
              const modelId = model.id.toLowerCase();
              return !modelId.includes('embed') && 
                     !modelId.includes('embedding') && 
                     !modelId.includes('text-embedding') &&
                     !modelId.includes('vector');
            });
            
            const models = filteredModels.map(model => ({
              id: model.id,
              name: model.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }));
            
            setAvailableModels(models);
            if (models.length > 0) {
              setSelectedModel(models[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        // Fallback models
        const fallbackModels = [
          { id: 'phi-4-mini-instruct', name: 'Phi-4 Mini Instruct' },
          { id: 'llama-3.2-1b-instruct', name: 'Llama 3.2 1B Instruct' },
          { id: 'gemma-3-27b-it', name: 'Gemma 3 27B IT' }
        ];
        setAvailableModels(fallbackModels);
        setSelectedModel(fallbackModels[0].id);
      }
    };

    fetchModels();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        <Header 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="app-content">
          <Sidebar 
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            availableModels={availableModels}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isMobile={isMobile}
          />
          <main className={`main-content ${sidebarOpen && !isMobile ? 'with-sidebar' : ''}`}>
            <ChatInterface selectedModel={selectedModel} />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
