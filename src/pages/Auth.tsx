import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AuthTest } from '@/components/AuthTest';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
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
            <CardTitle>Erreur d'authentification</CardTitle>
            <CardDescription>
              Une erreur s'est produite lors du chargement du système d'authentification. Veuillez actualiser la page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Actualiser la page
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
            title: "Bienvenue !",
            description: "Connexion réussie. Redirection vers l'accueil...",
          });
          // Redirect to home page after successful login
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
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
          toast({
            title: "Compte créé ! 🎉",
            description: "Votre compte a été créé avec succès. Redirection vers l'accueil...",
            duration: 3000,
          });
          // Redirect to home page after successful signup
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Une erreur s'est produite",
        description: "Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Redirect to OTP password reset page
    window.location.href = '/otp-reset-password';
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <AuthTest />
        <Card>
        <CardHeader>
          <CardTitle>
            {showForgotPassword 
              ? 'Réinitialiser le mot de passe' 
              : (isLogin ? 'Connexion' : 'Inscription')
            }
          </CardTitle>
          <CardDescription>
            {showForgotPassword 
              ? 'Saisissez votre email pour recevoir les instructions de réinitialisation'
              : (isLogin 
                ? 'Saisissez vos identifiants pour accéder à votre compte'
                : 'Créez un nouveau compte pour commencer'
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
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer l\'email de réinitialisation'
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
                  Retour à la connexion
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
                    <Label htmlFor="name">Nom (Optionnel)</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom complet"
                      disabled={loading}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
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
                      Mot de passe oublié ?
                    </Button>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Veuillez patienter...
                    </>
                  ) : (
                    isLogin ? 'Se connecter' : 'S\'inscrire'
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
                    ? "Vous n'avez pas de compte ? Inscrivez-vous" 
                    : "Vous avez déjà un compte ? Connectez-vous"
                  }
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}