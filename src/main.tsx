import * as React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make React globally available to prevent conflicts with external scripts
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
}

// Robust initialization with retry logic
const initializeApp = () => {
  try {
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }

    // Clear any existing content
    rootElement.innerHTML = '';
    
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Retry after a short delay
    setTimeout(() => {
      console.log('Retrying app initialization...');
      initializeApp();
    }, 100);
  }
};

// Wait for both DOM and all scripts to be ready
if (document.readyState === 'complete') {
  initializeApp();
} else {
  window.addEventListener('load', initializeApp);
}
