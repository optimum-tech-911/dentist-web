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
import { AlertCircle, RefreshCw, Mail, CheckCircle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
          const emailResult = await sendConfirmationEmail(email, name);
          
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
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email.",
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
          title: "Erreur lors de l'envoi du code",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Show OTP verification step
        setShowForgotPassword(false);
        setShowOtpVerification(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Une erreur s'est produite",
        description: "Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer le code à 6 chiffres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    clearError();

    try {
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (error) {
        toast({
          title: "Code invalide",
          description: "Le code OTP est incorrect ou a expiré.",
          variant: "destructive"
        });
        return;
      }

      if (data.session) {
        toast({
          title: "Code vérifié !",
          description: "Définissez maintenant votre nouveau mot de passe.",
        });
        setShowOtpVerification(false);
        setShowPasswordChange(true);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Erreur de vérification",
        description: "Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await resetPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    clearError();

    try {
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Mot de passe mis à jour !",
        description: "Votre mot de passe a été réinitialisé avec succès.",
      });

      // Reset all states and redirect to login
      setShowPasswordChange(false);
      setShowOtpVerification(false);
      setShowForgotPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      window.location.reload(); // Refresh to show login form
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
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
          <p className="text-muted-foreground">Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showPasswordChange ? (
              'Nouveau mot de passe'
            ) : showOtpVerification ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Vérifier le code OTP
              </>
            ) : showForgotPassword ? (
              <>
                <Mail className="h-5 w-5" />
                Réinitialiser le mot de passe
              </>
            ) : (
              isLogin ? 'Connexion' : 'Inscription'
            )}
          </CardTitle>
          <CardDescription>
            {showPasswordChange
              ? 'Définissez votre nouveau mot de passe'
              : showOtpVerification
              ? `Entrez le code à 6 chiffres envoyé à ${email}`
              : showForgotPassword 
              ? 'Saisissez votre email pour recevoir un code de vérification'
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

          {showPasswordChange ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  placeholder="Répétez le mot de passe"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          ) : showOtpVerification ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Code de vérification</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  'Vérifier le code'
                )}
              </Button>

              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm"
                >
                  Renvoyer le code
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setShowOtpVerification(false);
                    setOtp('');
                  }}
                  className="text-sm"
                  disabled={loading}
                >
                  Retour à la connexion
                </Button>
              </div>
            </form>
          ) : showForgotPassword ? (
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
                  'Envoyer le code OTP'
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
                <Button type="submit" className="w-full" disabled={loading || emailLoading}>
                  {loading || emailLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {emailLoading ? 'Envoi de l\'email de bienvenue...' : 'Veuillez patienter...'}
                    </>
                  ) : (
                    <>
                      {!isLogin && <Mail className="mr-2 h-4 w-4" />}
                      {isLogin ? 'Se connecter' : 'S\'inscrire et envoyer email de bienvenue'}
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
  );
}