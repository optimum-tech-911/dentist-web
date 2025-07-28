import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shield } from 'lucide-react';

// Simple admin email storage (in localStorage for persistence)
const ADMIN_EMAILS_KEY = 'ufsbd_admin_emails';

export const getAdminEmails = (): string[] => {
  try {
    const stored = localStorage.getItem(ADMIN_EMAILS_KEY);
    return stored ? JSON.parse(stored) : [
      'admin@ufsbd34.fr',
      'doctor@ufsbd34.fr',
      'amelie.cherbonneau@example.com',
      'abdessamed.abdessadok@example.com',
      'helene.sabatier@example.com',
      'alexandre.yeche@example.com',
      'pascal.rouzeyre@example.com',
      'vincent.tiers@example.com',
    ];
  } catch {
    return [];
  }
};

export const addAdminEmail = (email: string): void => {
  const emails = getAdminEmails();
  if (!emails.includes(email.toLowerCase())) {
    emails.push(email.toLowerCase());
    localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(emails));
  }
};

export const removeAdminEmail = (email: string): void => {
  const emails = getAdminEmails();
  const filtered = emails.filter(e => e !== email.toLowerCase());
  localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(filtered));
};

export default function AdminAccessManager() {
  const [emails, setEmails] = useState<string[]>(getAdminEmails());
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      addAdminEmail(newEmail.trim());
      setEmails(getAdminEmails());
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    removeAdminEmail(email);
    setEmails(getAdminEmails());
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">Add Admin Email</Label>
            <div className="flex gap-2">
              <Input
                id="new-email"
                type="email"
                placeholder="admin@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button onClick={handleAddEmail} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Admin Emails</Label>
            <div className="space-y-2">
              {emails.map((email) => (
                <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <Badge variant="secondary">{email}</Badge>
                  <Button
                    onClick={() => handleRemoveEmail(email)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• These emails will have admin access regardless of database roles</p>
            <p>• Changes are saved locally and persist across sessions</p>
            <p>• Add your email here to get immediate admin access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}