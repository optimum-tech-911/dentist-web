import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import test utilities in development
if (import.meta.env.DEV) {
  import('./lib/test-supabase');
  import('./lib/website-test');
}

// Simple error boundary component
class ErrorBoundary extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
        <h1>Application Error</h1>
        <p>Sorry, something went wrong while loading the application.</p>
        <p>Please refresh the page or contact support if the problem persists.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          Refresh Page
        </button>
      </div>
    `;
  }
}

// Register custom element for error boundary
customElements.define('error-boundary', ErrorBoundary);

// Check environment variables in development only
if (import.meta.env.DEV) {
  try {
    const { checkEnvironmentVariables } = await import('./lib/env-check');
    checkEnvironmentVariables();
  } catch (error) {
    console.warn('Environment check failed:', error);
  }
}

// Wrap the app rendering in error boundary
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  // Replace the root element with error boundary
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = '<error-boundary></error-boundary>';
  } else {
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
        <h1>Application Error</h1>
        <p>Sorry, something went wrong while loading the application.</p>
        <p>Please refresh the page or contact support if the problem persists.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
