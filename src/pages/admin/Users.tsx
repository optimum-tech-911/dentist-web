import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur lors du chargement des utilisateurs",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const assignAdminByEmail = async () => {
    if (!adminEmail.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir une adresse email",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, try to find user by email and update their role
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail.trim());

      if (fetchError) throw fetchError;

      if (existingUsers && existingUsers.length > 0) {
        // User exists, update their role
        const { error } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('email', adminEmail.trim());

        if (error) throw error;

        toast({
          title: "Rôle admin assigné ! ✅",
          description: `${adminEmail} a maintenant le rôle d'administrateur`,
        });
        
        await fetchUsers(); // Refresh the list
        setAdminEmail(''); // Clear the input
      } else {
        // User doesn't exist in public.users, check auth.users
        toast({
          title: "Utilisateur non trouvé",
          description: "L'utilisateur doit d'abord créer un compte sur le site",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le rôle d'administrateur",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      if (error) throw error;
      await fetchUsers(); // Ensure UI is always in sync with backend
      toast({
        title: 'User deleted',
        description: 'The user has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the user',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'author':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      {/* Quick Admin Assignment Section */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Shield className="h-5 w-5" />
            Assigner un Rôle d'Administrateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Saisir l'email de l'utilisateur..."
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={assignAdminByEmail}
              className="bg-red-600 hover:bg-red-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Assigner Admin
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            ⚠️ L'utilisateur doit d'abord avoir créé un compte sur le site
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{user.email}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Change Role:</label>
                <Select
                  value={user.role}
                  onValueChange={(value) => updateUserRole(user.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(user.id)}
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}