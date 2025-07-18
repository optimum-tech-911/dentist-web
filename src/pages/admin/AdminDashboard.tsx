import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Clock, Users, PenTool, Home } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet';

interface DashboardStats {
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  totalUsers: number;
}

export function useSupabaseKeepAlive() {
  useEffect(() => {
    const interval = setInterval(async () => {
      // Ping a lightweight endpoint or table
      await supabase.from('users').select('id').limit(1);
    }, 10 * 60 * 1000); // every 10 minutes

    return () => clearInterval(interval);
  }, []);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    totalUsers: 0
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
    <>
      <Helmet>
        <title>Admin Dashboard | UFSBD</title>
        <meta name="description" content="Admin dashboard for managing articles, users, and contact messages for UFSBD." />
      </Helmet>
      <div className="space-y-6">
        <img src="/ufsbd-logo.png.jpg" alt="UFSBD Logo" className="h-20 mb-2 mx-auto" />
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

        {/* Recent Contact Submissions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Messages de contact récents (30 jours)</h2>
          {loadingContacts ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contactSubmissions.length === 0 ? (
            <div className="text-muted-foreground">Aucun message reçu ces 30 derniers jours.</div>
          ) : (
            <div className="space-y-4">
              {contactSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{submission.name}</CardTitle>
                      <Badge variant="secondary">{new Date(submission.created_at).toLocaleDateString()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{submission.email} {submission.phone && <>| {submission.phone}</>}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-muted-foreground">{submission.message}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}