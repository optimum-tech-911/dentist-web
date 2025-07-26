import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details for debugging
    const errorDetails = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.group('🔍 Error Details');
    console.log('Error ID:', errorDetails.errorId);
    console.log('Message:', errorDetails.message);
    console.log('Stack:', errorDetails.stack);
    console.log('Component Stack:', errorDetails.componentStack);
    console.log('URL:', errorDetails.url);
    console.log('Timestamp:', errorDetails.timestamp);
    console.groupEnd();

    // Store error in localStorage for debugging
    try {
      const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errorLog.push(errorDetails);
      // Keep only last 10 errors
      if (errorLog.length > 10) {
        errorLog.splice(0, errorLog.length - 10);
      }
      localStorage.setItem('errorLog', JSON.stringify(errorLog));
    } catch (e) {
      console.warn('Could not save error to localStorage:', e);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Our team has been notified and is working to fix it.
            </p>

            {/* Error ID for debugging */}
            {this.state.errorId && (
              <div className="mb-6 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Error ID: <code className="bg-background px-2 py-1 rounded text-xs">{this.state.errorId}</code>
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleRetry}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                🔄 Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
              >
                🏠 Go Home
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
              >
                🔄 Reload Page
              </button>
            </div>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                  🔍 Error Details (Development)
                </summary>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Error Message:</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto text-red-600">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Stack Trace:</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Component Stack:</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Contact information */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                If this problem persists, please contact support:
              </p>
              <p className="text-sm">
                📧 <a href="mailto:ufsbd34@ufsbd.fr" className="text-primary hover:underline">
                  ufsbd34@ufsbd.fr
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 