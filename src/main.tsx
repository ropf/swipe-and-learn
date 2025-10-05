import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure React is fully loaded before rendering
const initApp = () => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  // Verify React is available
  if (typeof React === 'undefined') {
    console.error('React is not loaded');
    return;
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
