import { useState } from 'react';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const EmailTest = () => {
  const [email, setEmail] = useState('');
  const { sendConfirmationEmail, isLoading, error, success } = useEmailConfirmation();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const result = await sendConfirmationEmail(email);
    
    if (result.success) {
      console.log('✅ Email sent successfully!', result);
    } else {
      console.error('❌ Failed to send email:', result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Email Confirmation
          </CardTitle>
          <CardDescription>
            Test the Supabase Edge Function for sending confirmation emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success Alert */}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 Confirmation email sent successfully! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to send email: {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
                disabled={isLoading}
              />
            </div>



            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </form>

          {/* Function Info */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700 mb-1">Function URL:</p>
            <p className="text-gray-600 break-all">
              https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};