import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./components/rich-text-editor.css";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Simple test component
const TestComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
    <div className="text-center text-white p-8">
      <h1 className="text-4xl font-bold mb-4">🦷 UFSBD Hérault</h1>
      <p className="text-xl mb-4">Application is working!</p>
      <p className="text-sm opacity-80">If you can see this, the app is loading correctly.</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Simple fallback component
const SimpleFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-500 p-4">
    <div className="text-center text-white max-w-md">
      <h1 className="text-2xl font-bold mb-4">App Error</h1>
      <p className="mb-4">Something went wrong while loading the application.</p>
      <div className="bg-red-600 p-3 rounded mb-4 text-left">
        <p className="text-sm font-mono">{error.message}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="bg-white text-red-500 px-4 py-2 rounded hover:bg-gray-100"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary fallback={<SimpleFallback error={new Error("Unknown error")} />}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<TestComponent />} />
                <Route path="*" element={<TestComponent />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
