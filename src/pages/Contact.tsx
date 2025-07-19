import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/components/ContactForm';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';
import { Instagram } from 'lucide-react';

export default function Contact() {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { user, userRole, signOut } = useAuth();

  return (
    <>
      <Helmet>
        <title>Contact | UFSBD</title>
        <meta name="description" content="Contactez l'équipe UFSBD pour toute question ou demande d'information sur la santé dentaire." />
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
                <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                  <Link to="/blog">Actualités</Link>
                </Button>
                <Button variant="ghost" asChild className="hover:text-primary transition-colors">
                  <Link to="/organigramme">Organisation</Link>
                </Button>
                <Button variant="ghost" asChild className="hover:text-primary transition-colors bg-blue-100 text-blue-700">
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
                  <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                    <Link to="/blog" onClick={() => setShowMobileNav(false)}>Actualités</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                    <Link to="/organigramme" onClick={() => setShowMobileNav(false)}>Organisation</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors bg-blue-100 text-blue-700">
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Breadcrumb */}
          <nav className="flex justify-center mb-6">
            <ol className="flex items-center space-x-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-primary font-medium">Contact</li>
            </ol>
          </nav>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-xl text-muted-foreground">
              N'hésitez pas à nous contacter pour toute question ou demande d'information
            </p>
          </div>

          <div className="flex justify-center">
            <ContactForm title="Formulaire de contact" />
          </div>

          <div className="mt-12 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Autres moyens de nous contacter</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>📧 Email: ufsbd34@ufsbd.fr</p>
              <p>📍 Adresse: Union Française pour la Santé Bucco-Dentaire - Section 34</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <a href="https://www.instagram.com/ufsbd34?igsh=N3d5NHViZnlmbnB0" target="_blank" rel="noopener noreferrer" title="Instagram">
                <Instagram className="h-6 w-6 text-pink-500 hover:text-pink-700 transition-colors" />
              </a>
              <span className="text-muted-foreground">@ufsbd34</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}