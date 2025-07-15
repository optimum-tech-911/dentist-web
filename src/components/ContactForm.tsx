import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ContactFormProps {
  trigger?: React.ReactNode;
  title?: string;
  isModal?: boolean;
}

export function ContactForm({ trigger, title = "Nous contacter", isModal = false }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, message: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to database
      const { error } = await supabase
        .from('contact_submissions')
        .insert(formData);

      if (error) throw error;

      // Fetch all doctor and admin emails
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('email, role');
      if (userError) throw userError;
      const recipients = users
        .filter(u => u.role === 'admin' || u.role === 'doctor')
        .map(u => u.email);
      // Always include the main admin email as fallback
      if (!recipients.includes('ufsbd34@ufsbd.fr')) recipients.push('ufsbd34@ufsbd.fr');

      // Create a mailto link for all recipients (fallback for now)
      const mailtoLink = `mailto:${recipients.join(',')}` +
        `?subject=Contact depuis le site web&body=Nom: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0ATéléphone: ${formData.phone}%0D%0AMessage: ${formData.message}`;
      window.location.href = mailtoLink;

      toast({
        title: 'Message envoyé!',
        description: 'Votre message a été envoyé. Nous vous répondrons rapidement.'
      });

      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleNameChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={handleMessageChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Envoi en cours...' : 'Envoyer'}
      </Button>
    </form>
  );

  if (isModal) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
                  <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderForm()}
      </CardContent>
    </Card>
  );
}