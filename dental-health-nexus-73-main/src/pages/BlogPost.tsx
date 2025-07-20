import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_email: string;
  created_at: string;
  image?: string;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { user, userRole, signOut } = useAuth();

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .eq('status', 'approved')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          console.error('Error fetching post:', error);
        }
      } else {
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setNotFound(true);
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

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{post?.title ? `${post.title} | UFSBD` : 'Article de blog | UFSBD'}</title>
        <meta name="description" content={post?.excerpt || 'Lire cet article de blog sur la santé dentaire proposé par UFSBD.'} />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Navigation Bar */}
        <header className="bg-white/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link to="/">
                  <img 
                    src="/ufsbd-logo.png.jpg" 
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

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex justify-center mb-6">
            <ol className="flex items-center space-x-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">
                  Actualités
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-primary font-medium">{post?.title || 'Article'}</li>
            </ol>
          </nav>
          <Button variant="outline" asChild className="mb-6">
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux articles
            </Link>
          </Button>

          <article className="space-y-6">
            <header className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{post.category}</Badge>
                <span>•</span>
                <time>{new Date(post.created_at).toLocaleDateString()}</time>
              </div>
              
              <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
            </header>

            {post.image && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <MarkdownRenderer content={post.content} />
            </div>
          </article>
        </div>
      </div>
    </>
  );
}