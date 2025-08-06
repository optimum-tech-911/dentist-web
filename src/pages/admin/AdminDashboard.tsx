import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, Users, PenTool, Home, Shield, Image, AlertTriangle } from 'lucide-react';
import AdminAccessManager from '@/components/AdminAccessManager';
import { quickHealthCheck } from '@/lib/gallery-health-check';


interface DashboardStats {
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  totalUsers: number;
  galleryHealth: {
    status: 'healthy' | 'warning' | 'error';
    brokenCount: number;
  } | null;
}



export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    totalUsers: 0,
    galleryHealth: null
  });
  const [loading, setLoading] = useState(true);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchContactSubmissions();
  }, []);

  const fetchStats = async () => {
    try {
      // Get posts stats and gallery health
      const [postsResult, usersResult, healthResult] = await Promise.all([
        supabase.from('posts').select('status'),
        supabase.from('users').select('id', { count: 'exact' }),
        quickHealthCheck()
      ]);

      if (postsResult.data) {
        const totalPosts = postsResult.data.length;
        const pendingPosts = postsResult.data.filter(p => p.status === 'pending').length;
        const approvedPosts = postsResult.data.filter(p => p.status === 'approved').length;
        
        setStats({
          totalPosts,
          pendingPosts,
          approvedPosts,
          totalUsers: usersResult.count || 0,
          galleryHealth: healthResult
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactSubmissions = async () => {
    setLoadingContacts(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContactSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getHealthIcon = () => {
    if (!stats.galleryHealth) return <Image className="h-4 w-4" />;
    
    switch (stats.galleryHealth.status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getHealthBadge = () => {
    if (!stats.galleryHealth) return <Badge variant="outline">Unknown</Badge>;
    
    switch (stats.galleryHealth.status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

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
    },
    {
      title: 'Galerie d\'Images',
      value: stats.galleryHealth?.brokenCount || 0,
      icon: Image,
      description: 'Images cassées détectées',
      health: stats.galleryHealth,
      healthIcon: getHealthIcon(),
      healthBadge: getHealthBadge()
    }
  ];

  return (
    <div className="space-y-6 bg-white min-h-screen">
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
          <Button asChild variant="outline">
            <Link to="/admin/users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gérer Utilisateurs
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/submit" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Écrire un Article
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin-access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Gérer Accès Admin
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
              <div className="flex items-center gap-2">
                {card.healthIcon && card.healthIcon}
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                {card.healthBadge && card.healthBadge}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Submissions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Contact Submissions</h2>
        {loadingContacts ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : contactSubmissions.length === 0 ? (
          <p className="text-muted-foreground">No contact submissions in the last 30 days.</p>
        ) : (
          <div className="space-y-4">
            {contactSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <CardTitle>{submission.name} ({submission.email})</CardTitle>
                  <CardDescription>
                    {submission.phone && <>Téléphone: {submission.phone} • </>}
                    {new Date(submission.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{submission.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}