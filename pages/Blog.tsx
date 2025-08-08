import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer';
import { SafeImage } from '@/components/SafeImage';
import { convertToPublicUrl } from '@/lib/utils';

// Helper function to refresh gallery image URLs
const refreshImageUrl = async (imageUrl: string): Promise<string> => {
  if (!imageUrl) return imageUrl;

  // If already an absolute URL and not a signed gallery URL, return as-is
  const isAbsolute = /^https?:\/\//i.test(imageUrl);
  if (isAbsolute && !imageUrl.includes('/storage/v1/object/sign/gallery/')) {
    return imageUrl;
  }

  // Check if it's a gallery signed URL (legacy support)
  if (imageUrl.includes('/storage/v1/object/sign/gallery/')) {
    try {
      const urlParts = imageUrl.split('/gallery/')[1]?.split('?')[0];
      if (urlParts) {
        // Convert to public URL (no expiry)
        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(urlParts);
        
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (error) {
      console.log('Could not convert to public URL, using original:', error);
    }
  }

  // Handle raw storage paths (e.g., "gallery/user/file.jpg" or "user-id/file.png")
  try {
    const normalizedPath = imageUrl.replace(/^gallery\//, '').split('?')[0];
    const { data } = supabase.storage.from('gallery').getPublicUrl(normalizedPath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  } catch (error) {
    console.log('Could not construct public URL from storage path:', error);
  }
  return imageUrl;
};

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_email: string;
  created_at: string;
  image?: string;
}

// Special badge color styles per post ID
const SPECIAL_BADGE_STYLES: Record<string, string> = {
  '2e731e37-25d9-4bd0-ad71-2dabed1b5a27': 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100',
};

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [refreshedImageUrls, setRefreshedImageUrls] = useState<Record<string, string>>({});
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();

  // IDs to hide from listing (e.g., lowercase duplicate)
  const HIDDEN_POST_IDS = new Set<string>([
    'f5dc1e2d-5fb4-44f2-968e-81ca4d78261b',
  ]);

  // Normalize title for consistent display
  const toDisplayTitle = (t?: string) => (t || '').replace(/\s+/g, ' ').trim();

  useEffect(() => {
    fetchApprovedPosts();
  }, []);

  const fetchApprovedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter out hidden posts by ID
      const visiblePosts = (data || []).filter(p => !HIDDEN_POST_IDS.has(p.id));
      setPosts(visiblePosts);
      
      // Refresh image URLs for posts that have gallery images
      if (visiblePosts.length > 0) {
        const urlPromises = visiblePosts
          .filter(post => post.image)
          .map(async (post) => {
            const refreshedUrl = await refreshImageUrl(post.image!);
            return { id: post.id, url: refreshedUrl };
          });
          
        const refreshedUrls = await Promise.all(urlPromises);
        const urlMap = refreshedUrls.reduce((acc, { id, url }) => {
          acc[id] = url;
          return acc;
        }, {} as Record<string, string>);
        
        setRefreshedImageUrls(urlMap);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Erreur lors du chargement des articles');
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchApprovedPosts} variant="outline">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog | UFSBD</title>
        <meta name="description" content="Découvrez les derniers articles, conseils et actualités sur la santé dentaire par UFSBD." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Navigation Bar */}
        <header className="bg-white/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link to="/">
                  <img 
                    src="/ufsbd-logo-new.jpg" 
                    alt="UFSBD Logo" 
                    className="h-12 md:h-16 w-auto hover:scale-105 transition-transform cursor-pointer" 
                  />
                </Link>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                  <Link to="/">Accueil</Link>
                </Button>
                <Button variant="ghost" asChild className="hover:text-primary transition-colors bg-blue-100 text-blue-700">
                  <Link to="/blog">Actualités</Link>
                </Button>
                <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                  <Link to="/organigramme">Organisation</Link>
                </Button>
                <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                  <Link to="/contact">Contact</Link>
                </Button>
                {user ? (
                  <div className="hidden md:flex items-center space-x-4">
                    {(userRole === 'admin' || userRole === 'author') && (
                      <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                        <Link to="/submit">Écrire un article</Link>
                      </Button>
                    )}
                    {userRole === 'admin' && (
                      <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                        <Link to="/admin">Admin</Link>
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground">Bonjour {user.email}</span>
                    <Button variant="outline" onClick={signOut} className="hover:bg-primary hover:text-white transition-colors">
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="btn-primary hidden md:inline-flex">
                    <Link to="/auth">Connexion</Link>
                  </Button>
                )}
              </nav>
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setShowMobileNav(!showMobileNav)}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
            {/* Mobile Menu */}
            {showMobileNav && (
              <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
                <div className="flex flex-col space-y-3 pt-4">
                  <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                    <Link to="/" onClick={() => setShowMobileNav(false)}>Accueil</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors bg-blue-100 text-blue-700">
                    <Link to="/blog" onClick={() => setShowMobileNav(false)}>Actualités</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                    <Link to="/organigramme" onClick={() => setShowMobileNav(false)}>Organisation</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                    <Link to="/contact" onClick={() => setShowMobileNav(false)}>Contact</Link>
                  </Button>
                  {user ? (
                    <>
                      {(userRole === 'admin' || userRole === 'author') && (
                        <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                          <Link to="/submit" onClick={() => setShowMobileNav(false)}>Écrire un article</Link>
                        </Button>
                      )}
                      {userRole === 'admin' && (
                        <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                          <Link to="/admin" onClick={() => setShowMobileNav(false)}>Admin</Link>
                        </Button>
                      )}
                      <div className="px-3 py-2 text-sm text-muted-foreground border-t">
                        Bonjour {user.email}
                      </div>
                      <Button variant="outline" onClick={() => { signOut(); setShowMobileNav(false); }} className="mx-3">
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="btn-primary mx-3">
                      <Link to="/auth" onClick={() => setShowMobileNav(false)}>Connexion</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex justify-center mb-6">
            <ol className="flex items-center space-x-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-primary font-medium">Actualités</li>
            </ol>
          </nav>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Actualités UFSBD</h1>
            <p className="text-xl text-muted-foreground">
              Découvrez nos dernières actualités et articles sur la santé bucco-dentaire
            </p>
          </div>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:scale-105">
                    {post.image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <SafeImage
                          src={refreshedImageUrls[post.id] || convertToPublicUrl(post.image)}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder.svg"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className={SPECIAL_BADGE_STYLES[post.id] || ''}>{post.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{toDisplayTitle(post.title)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <MarkdownRenderer content={post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}