import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting ultra-simple app...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  console.log('✅ Root element found');
  
  const root = createRoot(rootElement);
  console.log('✅ React root created');
  
  root.render(<App />);
  console.log('✅ App rendered successfully');
  
  // Hide loading screen
  document.body.classList.add('app-loaded');
  console.log('✅ Loading screen hidden');
  
} catch (error) {
  console.error('❌ App failed:', error);
  
  // Show error directly in root
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
            Something went wrong while loading the application.
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
            ${error.message}
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
          ">
            🔄 Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
