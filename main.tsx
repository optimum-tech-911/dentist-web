import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  showErrorFallback('Global error: ' + event.error?.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorFallback('Unhandled promise rejection: ' + event.reason);
});

// Error fallback function
function showErrorFallback(message: string) {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: white;
        padding: 20px;
      ">
        <div style="
          text-align: center;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem; font-weight: 600;">
            🚨 Application Error
          </h1>
          <p style="margin-bottom: 2rem; opacity: 0.9; line-height: 1.6;">
            Something went wrong while loading the application. This has been logged for debugging.
          </p>
          <div style="
            background: rgba(0, 0, 0, 0.3);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 2rem;
            text-align: left;
            font-family: monospace;
            font-size: 14px;
            overflow-x: auto;
          ">
            ${message}
          </div>
          <button onclick="window.location.reload()" style="
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            🔄 Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

// Simple error boundary component
class ErrorBoundary extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: white;
        padding: 20px;
      ">
        <div style="
          text-align: center;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem; font-weight: 600;">
            🚨 Application Error
          </h1>
          <p style="margin-bottom: 2rem; opacity: 0.9; line-height: 1.6;">
            Sorry, something went wrong while loading the application.
          </p>
          <button onclick="window.location.reload()" style="
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            🔄 Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

// Register custom element for error boundary
customElements.define('error-boundary', ErrorBoundary);

// Main app initialization with multiple fallbacks
function initializeApp() {
  try {
    // Check if root element exists
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found - check if index.html has <div id='root'></div>");
    }
    
    // Check if React is available
    if (typeof createRoot === 'undefined') {
      throw new Error("React createRoot is not available - check React installation");
    }
    
    // Create root and render app
    const root = createRoot(rootElement);
    
    // Wrap in try-catch for render errors
    try {
      root.render(<App />);
      console.log('✅ App rendered successfully');
    } catch (renderError) {
      console.error('❌ App render failed:', renderError);
      showErrorFallback('Render error: ' + renderError.message);
    }
    
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    showErrorFallback('Initialization error: ' + error.message);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
