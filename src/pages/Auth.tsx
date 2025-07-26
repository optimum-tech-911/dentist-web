import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Mail } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email confirmation hook
  const { sendConfirmationEmail, isLoading: emailLoading } = useEmailConfirmation();
  
  // Add error boundary for useAuth hook
  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    console.error('Auth hook error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>
              There was an error loading the authentication system. Please refresh the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, userRole, signIn, signUp, resetPassword, loading: authLoading, error: authError, clearError } = authData;
  const location = useLocation();

  // Redirect authenticated users based on their role
  if (user && userRole) {
    const from = location.state?.from?.pathname || '/';
    
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'author') {
      return <Navigate to="/submit" replace />;
    } else {
      return <Navigate to={from} replace />;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError(); // Clear any previous errors

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully."
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Error signing up",
            description: error.message,
            variant: "destructive"
          });
        } else {
          // Send confirmation email
          const emailResult = await sendConfirmationEmail(email);
          
          if (emailResult.success) {
            toast({
              title: "Account created! 🎉",
              description: "Welcome email sent! Please check your inbox for confirmation.",
              duration: 5000,
            });
          } else {
            toast({
              title: "Account created!",
              description: "Your account was created but we couldn't send the welcome email. You can still use your account.",
              variant: "default"
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    clearError(); // Clear any previous errors
    
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: "Error sending reset email",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset email sent!",
          description: "Please check your email for password reset instructions."
        });
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {showForgotPassword 
              ? 'Reset Password' 
              : (isLogin ? 'Sign In' : 'Sign Up')
            }
          </CardTitle>
          <CardDescription>
            {showForgotPassword 
              ? 'Enter your email to receive password reset instructions'
              : (isLogin 
                ? 'Enter your credentials to access your account'
                : 'Create a new account to get started'
              )
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show auth error if any */}
          {authError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {authError}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-red-800 underline ml-2"
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm"
                  disabled={loading}
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      disabled={loading}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {isLogin && (
                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm p-0 h-auto"
                      disabled={loading}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading || emailLoading}>
                  {loading || emailLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {emailLoading ? 'Sending welcome email...' : 'Please wait...'}
                    </>
                  ) : (
                    <>
                      {!isLogin && <Mail className="mr-2 h-4 w-4" />}
                      {isLogin ? 'Sign In' : 'Sign Up & Send Welcome Email'}
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                  disabled={loading}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}