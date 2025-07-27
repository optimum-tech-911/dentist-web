import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Shield, Clock } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email');
  const expiresAt = searchParams.get('expires');
  
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/reset-password-email');
      return;
    }
  }, [email, navigate]);

  // Timer for OTP expiration
  useEffect(() => {
    if (expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
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
  }, [expiresAt]);

  // Resend cooldown timer
  useEffect(() => {
    if (!canResend) {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 60000); // 1 minute cooldown

      return () => clearTimeout(timer);
    }
  }, [canResend]);

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

      toast({
        title: "Code OTP vérifié !",
        description: "Vous pouvez maintenant créer votre nouveau mot de passe.",
      });

      // Redirect to password reset page with email and OTP
      navigate(`/reset-password-new?email=${encodeURIComponent(email!)}&otp=${encodeURIComponent(otpCode)}`);

    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError('Une erreur est survenue lors de la vérification du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;
    
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

      setCanResend(false);
      setTimeLeft(600);
      setOtpCode(''); // Clear current OTP

      toast({
        title: "Nouveau code OTP envoyé !",
        description: "Un nouveau code de vérification a été envoyé à votre adresse email.",
      });

      // Update URL with new expiry time
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&expires=${encodeURIComponent(result.expires_at)}`, { replace: true });

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

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vérification OTP
          </CardTitle>
          <CardDescription>
            Saisissez le code OTP envoyé à votre email
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

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/reset-password-email')}
              className="text-sm"
              disabled={loading}
            >
              Retour à l'email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}