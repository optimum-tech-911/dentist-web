import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Clock, Users, PenTool, Home } from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  totalUsers: number;
}

export async function uploadGalleryVideo(file: File, userId: string) {
  // 1. Generate a unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // 2. Upload to Supabase Storage (gallery bucket)
  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 3. Get a signed URL (optional, for display)
  const { data: urlData } = await supabase.storage
    .from('gallery')
    .createSignedUrl(filePath, 3600);

  // 4. Insert metadata into gallery_video table
  const { data: dbData, error: dbError } = await supabase
    .from('gallery_video')
    .insert({
      name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      uploaded_by: userId
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from('gallery').remove([filePath]);
    throw dbError;
  }

  return {
    ...dbData,
    url: urlData?.signedUrl || ''
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get posts stats
      const [postsResult, usersResult] = await Promise.all([
        supabase.from('posts').select('status'),
        supabase.from('users').select('id', { count: 'exact' })
      ]);

      if (postsResult.data) {
        const totalPosts = postsResult.data.length;
        const pendingPosts = postsResult.data.filter(p => p.status === 'pending').length;
        const approvedPosts = postsResult.data.filter(p => p.status === 'approved').length;
        
        setStats({
          totalPosts,
          pendingPosts,
          approvedPosts,
          totalUsers: usersResult.count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Articles',
      value: stats.totalPosts,
      icon: FileText,
      description: 'Tous les articles de blog'
    },
    {
      title: 'Articles en attente',
      value: stats.pendingPosts,
      icon: Clock,
      description: 'En attente d\'approbation'
    },
    {
      title: 'Articles approuvés',
      value: stats.approvedPosts,
      icon: CheckCircle,
      description: 'Articles publiés'
    },
    {
      title: 'Total Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      description: 'Utilisateurs enregistrés'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue sur le tableau de bord administrateur UFSBD</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Page d'accueil
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/submit" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Écrire un Article
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}