import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/ContactForm';
import { Heart, Shield, Users, ChevronDown, ChevronUp } from 'lucide-react';
import doctorHeroImage from '@/assets/doctor-hero.jpg';

const Index = () => {
  const {
    user,
    userRole,
    signOut
  } = useAuth();
  const [showFullMission, setShowFullMission] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const services = [{
    title: "Prévention",
    description: "Conseils et actions de prévention bucco-dentaire pour tous les âges",
    icon: Shield,
    path: "/prevention",
    color: "from-blue-500 to-blue-600"
  }, {
    title: "Formation",
    description: "Formations et sensibilisation à la santé bucco-dentaire",
    icon: Users,
    path: "/formation",
    color: "from-cyan-500 to-cyan-600"
  }, {
    title: "Interventions",
    description: "Interventions en milieu scolaire et professionnel",
    icon: Heart,
    path: "/interventions",
    color: "from-blue-600 to-cyan-500"
  }];
  const missionText = {
    short: "L'UFSBD œuvre depuis plus de 50 ans pour la promotion de la santé bucco-dentaire.",
    full: "L'UFSBD œuvre depuis plus de 50 ans pour la promotion de la santé bucco-dentaire. Notre section de l'Hérault s'engage quotidiennement dans la prévention, la formation et l'information du public sur l'importance de la santé bucco-dentaire. Nous menons des actions concrètes auprès des écoles, entreprises et institutions pour sensibiliser à l'hygiène bucco-dentaire et promouvoir les bonnes pratiques."
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <a href="https://www.ufsbd.fr" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/lovable-uploads/ab742599-8097-48dc-a1b3-6d031d2f9718.png" 
                  alt="UFSBD Logo" 
                  className="h-12 md:h-16 w-auto hover:scale-105 transition-transform cursor-pointer" 
                />
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild className="hover:text-primary transition-colors">
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

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        {/* Doctor Background Image */}
        <div className="absolute inset-0">
          <img src={doctorHeroImage} alt="Professional dentist" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-600/80 to-cyan-500/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight drop-shadow-lg">
              Union Française pour la<br />
              <span className="text-yellow-300">Santé Bucco-Dentaire</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto drop-shadow-md">
              Section Hérault - Œuvrer pour une meilleure santé bucco-dentaire pour tous
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Button size="lg" asChild className="btn-accent text-lg px-8 py-3 shadow-xl">
                <Link to="/blog">📰 Nos actualités</Link>
              </Button>
              <ContactForm isModal trigger={<Button variant="outline" size="lg" className="-bottom-0 text-black text-black hover:text-black text-lg px-8 py-3 shadow-xl">
                    ✉️ Nous contacter
                  </Button>} />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-background to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold gradient-text mb-4">Nos Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos actions pour promouvoir la santé bucco-dentaire
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {services.map((service, index) => {
            const IconComponent = service.icon;
            return <ContactForm key={service.title} isModal title={`Demande d'information - ${service.title}`} trigger={<Card className={`h-full card-hover cursor-pointer shadow-lg hover:shadow-xl border border-white/20 bg-gradient-to-br ${service.color} transition-all duration-300`}>
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-white drop-shadow-md">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <CardDescription className="text-blue-100 text-lg drop-shadow-sm">
                          {service.description}
                        </CardDescription>
                      </CardContent>
                    </Card>} />;
          })}
          </div>
        </div>
      </section>

      {/* Who Are We Section */}
      <section className="py-20 bg-gradient-to-b from-cyan-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-4xl font-bold gradient-text">Qui sommes-nous ?</h2>
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  L'Union Française pour la Santé Bucco-Dentaire (UFSBD) est une association loi 1901 
                  créée en 1966, reconnue d'utilité publique depuis 1976. Nous sommes l'organisation 
                  de référence en matière de prévention bucco-dentaire en France.
                </p>
                <p className="text-lg leading-relaxed">
                  Forte de plus de 50 ans d'expérience, l'UFSBD fédère les professionnels de santé 
                  bucco-dentaire autour d'une mission commune : améliorer la santé bucco-dentaire 
                  de tous les Français par la prévention et l'éducation à la santé.
                </p>
                <p className="text-lg leading-relaxed">
                  Nos actions s'adressent à tous les publics, de la petite enfance au grand âge, 
                  avec une attention particulière portée aux populations les plus vulnérables.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-center animate-slide-up">
                  <div className="text-4xl font-bold gradient-text mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Années d'expérience</div>
                </div>
                <div className="text-center animate-slide-up">
                  <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">Professionnels engagés</div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-8 shadow-large">
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-large animate-glow">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">Notre Vision</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Une société où chacun peut bénéficier d'une santé bucco-dentaire optimale, 
                        grâce à la prévention et à l'éducation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-bold gradient-text mb-8">Notre Mission</h2>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-large">
              <p className="text-lg text-foreground leading-relaxed">
                {showFullMission ? missionText.full : missionText.short}
              </p>
              <Button variant="ghost" onClick={() => setShowFullMission(!showFullMission)} className="mt-4 text-primary hover:text-primary/80 transition-colors">
                {showFullMission ? <>Voir moins <ChevronUp className="ml-2 h-4 w-4" /></> : <>En savoir plus <ChevronDown className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <a href="https://www.ufsbd.fr" target="_blank" rel="noopener noreferrer">
                  <img src="/lovable-uploads/ab742599-8097-48dc-a1b3-6d031d2f9718.png" alt="UFSBD Logo" className="h-20 w-auto hover:scale-105 transition-transform cursor-pointer" />
                </a>
              </div>
              <p className="text-blue-200 leading-relaxed">
                Union Française pour la Santé Bucco-Dentaire - Section Hérault
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-yellow-300">Contact</h3>
              <div className="space-y-2 text-blue-200">
                <p>📧 Email: ufsbd34@ufsbd.fr</p>
                <p>📍 283 rue Alfred Nobel, 34200 Montpellier</p>
                <p>📞 Téléphone: 06 86 30 62 04</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-yellow-300">Liens utiles</h3>
              <div className="space-y-3">
                <div>
                  <Link to="/blog" className="text-blue-200 hover:text-yellow-300 transition-colors inline-flex items-center">
                    📰 Actualités
                  </Link>
                </div>
                <div>
                  <ContactForm isModal trigger={<button className="text-blue-200 hover:text-yellow-300 transition-colors text-left inline-flex items-center">
                        ✉️ Nous contacter
                      </button>} />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center">
            <p className="text-blue-300">
              © 2024 UFSBD Section Hérault. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;