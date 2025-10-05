// Force immediate execution and ensure React is available
(async () => {
  // Import React first
  const React = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { default: App } = await import('./App.tsx');
  
  // Import styles
  await import('./index.css');
  
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  const { StrictMode } = React;
  
  createRoot(rootElement).render(
    StrictMode ? <StrictMode><App /></StrictMode> : <App />
  );
})();
