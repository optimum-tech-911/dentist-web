import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Eye, EyeOff, Mail, Shield, Clock, ArrowLeft } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { sendOTPEmail, verifyOTP, updatePasswordWithOTP } from '@/utils/otpUtils';

type Step = 'email' | 'otp' | 'password';

export default function SimpleOTPReset() {
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP expiration
  useState(() => {
    if (currentStep === 'otp' && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            setError('Le code OTP a expiré. Veuillez en demander un nouveau.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await sendOTPEmail(email);
      
      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'envoi du code OTP.');
        return;
      }

      setTimeLeft(600); // 10 minutes
      setCanResend(false);
      setCurrentStep('otp');
      
      toast({
        title: "OTP envoyé !",
        description: `Code OTP envoyé à ${email}. Vérifiez votre boîte email.`,
      });
    } catch (error) {
      setError('Erreur lors de l\'envoi du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Veuillez saisir un code OTP valide (6 chiffres).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isValid = verifyOTP(email, otpCode);
      
      if (!isValid) {
        setError('Code OTP invalide ou expiré.');
        return;
      }

      setCurrentStep('password');
      toast({
        title: "Code OTP validé !",
        description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
      });
    } catch (error) {
      setError('Erreur lors de la vérification du code OTP.');
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
      const result = await updatePasswordWithOTP(email, password);
      
      if (!result.success) {
        setError(result.error || 'Erreur lors de la réinitialisation du mot de passe.');
        return;
      }

      toast({
        title: "Mot de passe mis à jour !",
        description: "Votre mot de passe a été réinitialisé avec succès.",
      });

      // Redirect to login page
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error) {
      setError('Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await sendOTPEmail(email);
      
      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'envoi du code OTP.');
        return;
      }

      setTimeLeft(600);
      setCanResend(false);
      
      toast({
        title: "Nouveau OTP envoyé !",
        description: `Nouveau code OTP envoyé à ${email}. Vérifiez votre boîte email.`,
      });
    } catch (error) {
      setError('Erreur lors de l\'envoi du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {currentStep === 'email' && 'Réinitialiser le mot de passe'}
              {currentStep === 'otp' && 'Vérifier le code OTP'}
              {currentStep === 'password' && 'Nouveau mot de passe'}
            </CardTitle>
            <CardDescription>
              {currentStep === 'email' && 'Saisissez votre email pour recevoir un code OTP'}
              {currentStep === 'otp' && `Code OTP envoyé à ${email}`}
              {currentStep === 'password' && 'Définissez votre nouveau mot de passe'}
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

            {currentStep === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer le code OTP
                    </>
                  )}
                </Button>
              </form>
            )}

            {currentStep === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label>Code OTP (6 chiffres)</Label>
                  <InputOTP
                    value={otpCode}
                    onChange={setOtpCode}
                    maxLength={6}
                    disabled={loading}
                    className="justify-center"
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
                  <div className="text-center text-sm text-muted-foreground">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Expire dans: {formatTime(timeLeft)}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
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
                    onClick={handleResendOTP}
                    disabled={!canResend || loading}
                    className="text-sm"
                  >
                    {canResend ? 'Renvoyer le code' : 'Renvoyer le code (60s)'}
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Nouveau mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Confirmer le mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}