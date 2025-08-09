import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./components/rich-text-editor.css";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DebugInfo } from "./components/DebugInfo";

// Lazy load components with error boundaries
const Index = lazy(() => import("./pages/Index").catch(() => ({ default: () => <FallbackPage title="Home Page" /> })));
const Auth = lazy(() => import("./pages/Auth").catch(() => ({ default: () => <FallbackPage title="Authentication" /> })));
const Blog = lazy(() => import("./pages/Blog").catch(() => ({ default: () => <FallbackPage title="Blog" /> })));
const BlogPost = lazy(() => import("./pages/BlogPost").catch(() => ({ default: () => <FallbackPage title="Blog Post" /> })));
const BlogSubmit = lazy(() => import("./pages/BlogSubmit").catch(() => ({ default: () => <FallbackPage title="Submit Blog" /> })));
const Contact = lazy(() => import("./pages/Contact").catch(() => ({ default: () => <FallbackPage title="Contact" /> })));
const Organigramme = lazy(() => import("./pages/Organigramme").catch(() => ({ default: () => <FallbackPage title="Organigramme" /> })));
const WriteBlog = lazy(() => import("./pages/WriteBlog").catch(() => ({ default: () => <FallbackPage title="Write Blog" /> })));
const EditBlog = lazy(() => import("./pages/EditBlog").catch(() => ({ default: () => <FallbackPage title="Edit Blog" /> })));
const TestPage = lazy(() => import("./pages/TestPage").catch(() => ({ default: () => <FallbackPage title="Test Page" /> })));
const PasswordReset = lazy(() => import("./pages/PasswordReset").catch(() => ({ default: () => <FallbackPage title="Password Reset" /> })));
const OTPPasswordReset = lazy(() => import("./pages/OTPPasswordReset").catch(() => ({ default: () => <FallbackPage title="OTP Password Reset" /> })));
const SimpleOTPReset = lazy(() => import("./pages/SimpleOTPReset").catch(() => ({ default: () => <FallbackPage title="Simple OTP Reset" /> })));
const PasswordResetEmail = lazy(() => import("./pages/PasswordResetEmail").catch(() => ({ default: () => <FallbackPage title="Password Reset Email" /> })));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP").catch(() => ({ default: () => <FallbackPage title="Verify OTP" /> })));
const ResetPasswordNew = lazy(() => import("./pages/ResetPasswordNew").catch(() => ({ default: () => <FallbackPage title="Reset Password" /> })));
const NotFound = lazy(() => import("./pages/NotFound").catch(() => ({ default: () => <FallbackPage title="Page introuvable" /> })));

// Admin components
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").catch(() => ({ default: () => <FallbackPage title="Admin Layout" /> })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").catch(() => ({ default: () => <FallbackPage title="Admin Dashboard" /> })));
const PendingPosts = lazy(() => import("./pages/admin/PendingPosts").catch(() => ({ default: () => <FallbackPage title="Pending Posts" /> })));
const ApprovedPosts = lazy(() => import("./pages/admin/ApprovedPosts").catch(() => ({ default: () => <FallbackPage title="Approved Posts" /> })));
const Users = lazy(() => import("./pages/admin/Users").catch(() => ({ default: () => <FallbackPage title="Users" /> })));
const Gallery = lazy(() => import("./pages/admin/Gallery").catch(() => ({ default: () => <FallbackPage title="Gallery" /> })));
const OrganigrammeAdmin = lazy(() => import("./pages/admin/OrganigrammeAdmin").catch(() => ({ default: () => <FallbackPage title="Organigramme Admin" /> })));
const Calendar = lazy(() => import("./pages/admin/Calendar").catch(() => ({ default: () => <FallbackPage title="Calendar" /> })));
const AdminAccessManager = lazy(() => import("./components/AdminAccessManager").catch(() => ({ default: () => <FallbackPage title="Admin Access Manager" /> })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Fallback page component
const FallbackPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center p-8 max-w-md">
      <div className="mb-6">
        <svg className="mx-auto h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-4">
        {title} - Erreur de chargement
      </h1>
      <p className="text-muted-foreground mb-6">
        Une erreur s'est produite lors du chargement de cette page. Veuillez actualiser la page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
      >
        Actualiser la page
      </button>
    </div>
  </div>
);

// Instant loading - no spinner
const LoadingSpinner = () => null;

// Simple fallback component for debugging
const SimpleFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center max-w-md">
      <h1 className="text-2xl font-bold text-foreground mb-4">Erreur de l'application</h1>
      <p className="text-muted-foreground mb-4">
        Une erreur s'est produite lors du chargement de l'application.
      </p>
      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-left">
        <p className="text-sm text-red-800 font-mono">{error.message}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
      >
        Actualiser la page
      </button>
    </div>
  </div>
);

// Error boundary wrapper for each route
const SafeRoute = ({ children }: { children: React.ReactNode }) => (
      <ErrorBoundary fallback={<FallbackPage title="Erreur de page" />}>
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
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
                <Route path="/" element={<SafeRoute><Index /></SafeRoute>} />
                <Route path="/auth" element={<SafeRoute><Auth /></SafeRoute>} />
                <Route path="/reset-password" element={<SafeRoute><PasswordReset /></SafeRoute>} />
                <Route path="/reset-password/*" element={<SafeRoute><PasswordReset /></SafeRoute>} />
                <Route path="/otp-reset-password" element={<SafeRoute><OTPPasswordReset /></SafeRoute>} />
                <Route path="/simple-otp-reset" element={<SafeRoute><SimpleOTPReset /></SafeRoute>} />
                <Route path="/reset-password-email" element={<SafeRoute><PasswordResetEmail /></SafeRoute>} />
                <Route path="/verify-otp" element={<SafeRoute><VerifyOTP /></SafeRoute>} />
                <Route path="/reset-password-new" element={<SafeRoute><ResetPasswordNew /></SafeRoute>} />
                <Route path="/blog" element={<SafeRoute><Blog /></SafeRoute>} />
                <Route path="/blog/:id" element={<SafeRoute><BlogPost /></SafeRoute>} />
                <Route path="/edit/:id" element={<SafeRoute><EditBlog /></SafeRoute>} />
                <Route path="/contact" element={<SafeRoute><Contact /></SafeRoute>} />
                <Route path="/organigramme" element={<SafeRoute><Organigramme /></SafeRoute>} />
                <Route path="/test" element={<SafeRoute><TestPage /></SafeRoute>} />
                <Route path="/write-blog" element={<SafeRoute><WriteBlog /></SafeRoute>} />
                <Route 
                  path="/submit" 
                  element={
                    <SafeRoute>
                      <ProtectedRoute requiredRole={["author", "admin", "doctor"]}>
                        <BlogSubmit />
                      </ProtectedRoute>
                    </SafeRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <SafeRoute>
                      <ProtectedRoute requiredRole={['admin', 'doctor']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    </SafeRoute>
                  }
                >
                  <Route index element={<SafeRoute><AdminDashboard /></SafeRoute>} />
                  <Route path="pending" element={<SafeRoute><PendingPosts /></SafeRoute>} />
                  <Route path="approved" element={<SafeRoute><ApprovedPosts /></SafeRoute>} />
                  <Route path="users" element={<SafeRoute><Users /></SafeRoute>} />
                  <Route path="gallery" element={<SafeRoute><Gallery /></SafeRoute>} />
                  <Route path="organigramme" element={<SafeRoute><OrganigrammeAdmin /></SafeRoute>} />
                  <Route path="calendar" element={<SafeRoute><Calendar /></SafeRoute>} />
                </Route>
                <Route path="/admin-access" element={<SafeRoute><AdminAccessManager /></SafeRoute>} />
                {/* Service pages placeholders */}
                <Route path="/prevention" element={
                  <SafeRoute>
                    <div className="min-h-screen flex items-center justify-center">
                      <h1 className="text-4xl font-bold">Prévention - Page en construction</h1>
                    </div>
                  </SafeRoute>
                } />
                <Route path="/formation" element={
                  <SafeRoute>
                    <div className="min-h-screen flex items-center justify-center">
                      <h1 className="text-4xl font-bold">Formation - Page en construction</h1>
                    </div>
                  </SafeRoute>
                } />
                <Route path="/interventions" element={
                  <SafeRoute>
                    <div className="min-h-screen flex items-center justify-center">
                      <h1 className="text-4xl font-bold">Interventions - Page en construction</h1>
                    </div>
                  </SafeRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<SafeRoute><NotFound /></SafeRoute>} />
              </Routes>
            </BrowserRouter>
            {import.meta.env.DEV && <DebugInfo />}
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
