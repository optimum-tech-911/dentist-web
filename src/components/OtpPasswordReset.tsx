import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type Step = 'request' | 'verify' | 'reset' | 'success';

export default function OtpPasswordReset() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send OTP for password recovery
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Don't create user if doesn't exist
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      toast({
        title: "Code OTP envoyé !",
        description: "Vérifiez votre email pour le code de vérification à 6 chiffres.",
        duration: 5000,
      });

      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Veuillez entrer le code OTP à 6 chiffres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP and get session
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        toast({
          title: "Code vérifié !",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
        });
        setStep('reset');
      } else {
        setError('Échec de la vérification du code OTP.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la vérification du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update password using the authenticated session
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message);
        return;
      }

      toast({
        title: "Mot de passe mis à jour !",
        description: "Votre mot de passe a été réinitialisé avec succès.",
      });

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setError(error.message);
        return;
      }

      toast({
        title: "Code renvoyé !",
        description: "Un nouveau code OTP a été envoyé à votre email.",
      });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du renvoi du code.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'request':
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Réinitialiser le mot de passe
              </CardTitle>
              <CardDescription>
                Entrez votre email pour recevoir un code de vérification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="votre@email.com"
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
              </form>
            </CardContent>
          </Card>
        );

      case 'verify':
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Vérifier le code OTP
              </CardTitle>
              <CardDescription>
                Entrez le code à 6 chiffres envoyé à {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
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

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm"
                  >
                    Renvoyer le code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 'reset':
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nouveau mot de passe</CardTitle>
              <CardDescription>
                Définissez votre nouveau mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
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
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Mot de passe réinitialisé !
              </CardTitle>
              <CardDescription>
                Votre mot de passe a été mis à jour avec succès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Button
                  onClick={() => window.location.href = '/auth'}
                  className="w-full"
                >
                  Aller à la connexion
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {renderStep()}

        {step !== 'success' && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => window.location.href = '/auth'}
              className="text-sm"
              disabled={loading}
            >
              Retour à la connexion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}