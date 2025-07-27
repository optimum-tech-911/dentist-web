import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isValidReset, setIsValidReset] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get parameters from URL
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');
  const email = searchParams.get('email'); // Fallback for direct email parameter

  useEffect(() => {
    const handleReset = async () => {
      console.log('🔍 Password Reset Debug:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
        type,
        email,
        allParams: Object.fromEntries(searchParams.entries())
      });

      // Quick validation - if we have any reset parameters, show the form
      if (type === 'recovery' && accessToken) {
        try {
          console.log('🔍 Setting session with access token...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (data.user && !error) {
            console.log('🔍 Session set successfully for:', data.user.email);
            setUserEmail(data.user.email);
            setIsValidReset(true);
          } else {
            console.error('🔍 Error setting session:', error);
            setError('Lien de réinitialisation invalide. Veuillez demander un nouveau lien.');
            // Don't show form if session is invalid
            setIsValidReset(false);
          }
        } catch (err) {
          console.error('🔍 Error handling reset:', err);
          setError('Erreur lors de la validation du lien. Veuillez demander un nouveau lien.');
          setIsValidReset(false);
        }
      } else {
        // No valid reset parameters
        console.log('🔍 No valid reset parameters');
        setError('Lien de réinitialisation invalide. Veuillez utiliser le lien depuis votre email.');
        setIsValidReset(false);
      }
    };

    // Add a small delay to prevent flash of loading screen
    const timer = setTimeout(handleReset, 100);
    return () => clearTimeout(timer);
  }, [accessToken, refreshToken, type, email, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔧 Updating password...');
      
      // Check if we have a valid session first
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔧 Current session:', sessionData.session ? 'Valid' : 'Invalid');
      
      if (!sessionData.session) {
        console.error('🔧 No valid session found');
        setError('Session invalide. Veuillez utiliser le lien de réinitialisation depuis votre email.');
        setLoading(false);
        return;
      }
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000) // Increased to 15 seconds
      );
      
      // Update password using Supabase
      const updatePromise = supabase.auth.updateUser({
        password: password
      });
      
      const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      console.log('🔧 Update result:', { data, error });

      if (error) {
        console.error('🔧 Password update error:', error);
        
        // Handle specific error cases
        if (error.message.includes('JWT')) {
          setError('Lien de réinitialisation expiré. Veuillez demander un nouveau lien.');
        } else if (error.message.includes('timeout')) {
          setError('La requête a pris trop de temps. Veuillez réessayer.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      console.log('🔧 Password updated successfully!');

      toast({
        title: "Mot de passe mis à jour !",
        description: "Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion...",
      });

      // Show redirecting state
      setIsRedirecting(true);

      // Show success message and redirect
      setTimeout(() => {
        console.log('🔧 Redirecting to login page...');
        // Force redirect to login page
        window.location.href = '/auth';
      }, 1500);
      
    } catch (error: any) {
      console.error('🔧 Unexpected error:', error);
      
      if (error.message === 'Request timeout') {
        setError('La requête a pris trop de temps. Veuillez réessayer ou utiliser un nouveau lien de réinitialisation.');
      } else {
        setError(error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
      }
      setLoading(false);
    }
  };

  if (!isValidReset) { // Show loading spinner while validating or error
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          {error ? (
            <>
              <div className="mb-6">
                <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Lien invalide
              </h1>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
              >
                Retour à la connexion
              </Button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Vérification du lien de réinitialisation...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isRedirecting) { // Show redirecting state
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium mb-2">Mot de passe mis à jour avec succès !</p>
          <p className="text-muted-foreground">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Réinitialiser le mot de passe</CardTitle>
          <CardDescription>
            Entrez votre nouveau mot de passe pour votre compte UFSBD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
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

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-sm"
              disabled={loading}
            >
              Retour à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}