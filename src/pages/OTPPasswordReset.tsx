import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Eye, EyeOff, Mail, Shield, Clock } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

type Step = 'email' | 'otp' | 'password';

export default function OTPPasswordReset() {
  const navigate = useNavigate();
  
  // Form states
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);

  // Timer for OTP expiration
  useEffect(() => {
    if (otpExpiresAt && currentStep === 'otp') {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(otpExpiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          setCanResend(true);
          setError('Le code OTP a expiré. Veuillez en demander un nouveau.');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [otpExpiresAt, currentStep]);

  // Resend cooldown timer
  useEffect(() => {
    if (!canResend && currentStep === 'otp') {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 60000); // 1 minute cooldown

      return () => clearTimeout(timer);
    }
  }, [currentStep, canResend]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the OTP password reset Edge Function
      const response = await fetch('https://cmcfeiskfdbsefzqywbk.supabase.co/functions/v1/otp-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'envoi du code OTP.');
        return;
      }

      setOtpExpiresAt(result.expires_at);
      setCanResend(false);
      setCurrentStep('otp');
      setTimeLeft(600); // 10 minutes in seconds

      toast({
        title: "Code OTP envoyé !",
        description: "Vérifiez votre boîte mail pour recevoir votre code de vérification à 6 chiffres.",
      });

    } catch (error: any) {
      console.error('OTP sending error:', error);
      setError('Une erreur est survenue lors de l\'envoi du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      setError('Veuillez saisir un code OTP à 6 chiffres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP using the database function
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_otp_code', { 
          user_email: email, 
          otp_code: otpCode 
        });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        setError('Erreur lors de la vérification du code OTP.');
        return;
      }

      if (!verifyResult.success) {
        setError(verifyResult.message);
        return;
      }

      setCurrentStep('password');
      
      toast({
        title: "Code OTP vérifié !",
        description: "Vous pouvez maintenant créer votre nouveau mot de passe.",
      });

    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError('Une erreur est survenue lors de la vérification du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      // Reset password using the database function
      const { data: resetResult, error: resetError } = await supabase
        .rpc('verify_otp_and_reset_password', { 
          user_email: email, 
          otp_code: otpCode,
          new_password: password
        });

      if (resetError) {
        console.error('Password reset error:', resetError);
        setError('Erreur lors de la réinitialisation du mot de passe.');
        return;
      }

      if (!resetResult.success) {
        setError(resetResult.message);
        return;
      }

      toast({
        title: "Mot de passe réinitialisé !",
        description: "Votre mot de passe a été mis à jour avec succès. Redirection vers la page de connexion...",
      });

      // Redirect to login page after success
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      setError('Une erreur est survenue lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://cmcfeiskfdbsefzqywbk.supabase.co/functions/v1/otp-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors du renvoi du code OTP.');
        return;
      }

      setOtpExpiresAt(result.expires_at);
      setCanResend(false);
      setTimeLeft(600);
      setOtpCode(''); // Clear current OTP

      toast({
        title: "Nouveau code OTP envoyé !",
        description: "Un nouveau code de vérification a été envoyé à votre adresse email.",
      });

    } catch (error: any) {
      console.error('OTP resend error:', error);
      setError('Une erreur est survenue lors du renvoi du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 'email' && <Mail className="h-5 w-5" />}
            {currentStep === 'otp' && <Shield className="h-5 w-5" />}
            {currentStep === 'password' && <RefreshCw className="h-5 w-5" />}
            Réinitialiser le mot de passe
          </CardTitle>
          <CardDescription>
            {currentStep === 'email' && 'Entrez votre email pour recevoir un code de vérification'}
            {currentStep === 'otp' && 'Saisissez le code OTP envoyé à votre email'}
            {currentStep === 'password' && 'Créez votre nouveau mot de passe'}
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

          {/* Step 1: Email Input */}
          {currentStep === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@example.com"
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
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer le code OTP
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Code envoyé à : <strong>{email}</strong>
                </p>
                {timeLeft > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Expire dans : <strong>{formatTime(timeLeft)}</strong>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Code OTP (6 chiffres)</Label>
                  <div className="flex justify-center">
                    <InputOTP 
                      maxLength={6} 
                      value={otpCode} 
                      onChange={setOtpCode}
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

                <Button type="submit" className="w-full" disabled={loading || otpCode.length !== 6}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'Vérifier le code OTP'
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={!canResend || loading}
                    className="text-sm"
                  >
                    {canResend ? 'Renvoyer le code OTP' : 'Renvoyer dans 1 minute'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: New Password */}
          {currentStep === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          )}

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