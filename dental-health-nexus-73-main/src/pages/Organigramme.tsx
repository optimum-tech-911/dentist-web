import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Award, Building2, Heart, BookOpen, Shield, Crown, UserCog } from 'lucide-react';
import { OrganigramService, type OrganigramMember } from '@/lib/organigram';
import { OrganigrammeCard } from '@/components/OrganigrammeCard';
import { useAuth } from '@/hooks/useAuth';
import { Tree } from '@minoru/react-dnd-treeview';

export default function Organigramme() {
  const [orgData, setOrgData] = useState<OrganigramMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const canEdit = userRole === 'admin' || userRole === 'doctor';

  useEffect(() => {
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    try {
      const members = await OrganigramService.getMembers();
      setOrgData(members);
    } catch (error) {
      console.error('Error fetching org data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (role: string) => {
    const iconMap = {
      president: Crown,
      vicePresidents: UserCheck,
      secretaire: BookOpen,
      secretaireAdjoint: BookOpen,
      tresorier: Shield,
      tresorierAdjoint: Shield,
      chargesMission: UserCog,
      verificateur: Award
    };
    return iconMap[role as keyof typeof iconMap] || Users;
  };

  const getRoleLabel = (role: string) => {
    return OrganigramService.getRoleLabel(role as any);
  };

  const getRoleColor = (role: string) => {
    const colorMap = {
      president: 'bg-gradient-to-br from-green-600 to-green-700',
      vicePresidents: 'bg-gradient-to-br from-blue-600 to-blue-700',
      secretaire: 'bg-gradient-to-br from-purple-600 to-purple-700',
      secretaireAdjoint: 'bg-gradient-to-br from-green-500 to-green-600',
      tresorier: 'bg-gradient-to-br from-blue-500 to-blue-600',
      tresorierAdjoint: 'bg-gradient-to-br from-purple-500 to-purple-600',
      chargesMission: 'bg-gradient-to-br from-green-700 to-green-800',
      verificateur: 'bg-gradient-to-br from-blue-700 to-blue-800'
    };
    return colorMap[role as keyof typeof colorMap] || 'bg-gradient-to-br from-purple-500 to-purple-600';
  };

  const MemberCard = ({ member }: { member: OrganigramMember }) => {
    const IconComponent = getIcon(member.role);
    const roleColor = getRoleColor(member.role);
    
    return (
      <Card className={`h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 ${roleColor} text-white overflow-hidden`}>
        <CardHeader className="text-center pb-4 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white/10"></div>
          
          {/* Image or Icon */}
          <div className="relative z-10 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-white/30">
            {member.image?.url ? (
              <img 
                src={member.image.url} 
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <IconComponent className={`h-10 w-10 text-white ${member.image?.url ? 'hidden' : ''}`} />
          </div>
          
          {/* Role Badge */}
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2 shadow-lg">
            {getRoleLabel(member.role)}
          </Badge>
          
          {/* Title */}
          <CardTitle className="text-xl text-white drop-shadow-lg font-bold">
            {member.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center relative z-10">
          {/* Name */}
          <p className="text-white font-semibold text-lg mb-3 drop-shadow-lg">{member.name}</p>
          
          {/* Description */}
          {member.description && (
            <p className="text-white/95 text-sm leading-relaxed drop-shadow-md">
              {member.description}
            </p>
          )}
          
          {/* Members list for commissions */}
          {member.members && member.members.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <h4 className="text-white font-medium text-sm mb-2 drop-shadow-md">Membres:</h4>
              <ul className="space-y-1">
                {member.members.map((memberName: string, index: number) => (
                  <li key={index} className="text-white/90 text-xs drop-shadow-sm">• {memberName}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement de l'organigramme...</p>
        </div>
      </div>
    );
  }

  // Group members by role for better organization
  const president = orgData.find(member => member.role === 'president');
  const bureauMembers = orgData.filter(member => 
    ['secretaire', 'secretaireAdjoint', 'tresorier', 'tresorierAdjoint'].includes(member.role)
  );
  const otherMembers = orgData.filter(member => 
    ['vicePresidents', 'chargesMission', 'verificateur'].includes(member.role)
  );

  const treeData = orgData.map(member => ({
    id: member.id,
    parent: member.parent_id ?? 0,
    text: member.name,
    ...member
  }));

  const handleDrop = canEdit
    ? async (newTree, { dragSourceId, dropTargetId }) => {
        await OrganigramService.updateMember(dragSourceId, { parent_id: dropTargetId === 0 ? null : dropTargetId });
        fetchOrgData();
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
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
              <Button variant="ghost" asChild className="hover:text-primary transition-colors bg-blue-100 text-blue-700">
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
                <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors">
                  <Link to="/blog" onClick={() => setShowMobileNav(false)}>Actualités</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start hover:text-primary transition-colors bg-blue-100 text-blue-700">
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

      {/* Page Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center mb-6">
            <ol className="flex items-center space-x-2 text-blue-100">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li className="text-blue-200">/</li>
              <li className="text-white font-medium">Organigramme</li>
            </ol>
          </nav>
          
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Organigramme UFSBD</h1>
          <p className="text-xl text-blue-100 drop-shadow-md">
            Section Hérault - Structure organisationnelle
          </p>
          <p className="text-blue-200 mt-2">
            Notre équipe dédiée à la santé bucco-dentaire
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
          {/* Président */}
          {president && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Présidence</h2>
            <div className="flex justify-center">
              <div className="max-w-md">
                <OrganigrammeCard member={president} onUpdated={fetchOrgData} editable={canEdit} />
              </div>
              </div>
          </div>
        )}

        {/* Bureau Exécutif */}
        {bureauMembers.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Bureau Exécutif</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {bureauMembers.map((member) => (
                <OrganigrammeCard key={member.id} member={member} onUpdated={fetchOrgData} editable={canEdit} />
              ))}
                </div>
              </div>
        )}

        {/* Autres Membres */}
        {otherMembers.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Équipe de Direction</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {otherMembers.map((member) => (
                <OrganigrammeCard key={member.id} member={member} onUpdated={fetchOrgData} editable={canEdit} />
              ))}
            </div>
          </div>
        )}

        {/* Tous les Membres (Vue d'ensemble) */}
        {orgData.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Vue d'Ensemble</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {orgData.map((member) => (
                <OrganigrammeCard key={member.id} member={member} onUpdated={fetchOrgData} editable={canEdit} />
            ))}
          </div>
        </div>
        )}

        {/* Contact */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                <strong>UFSBD Section Hérault</strong>
              </p>
              <p className="text-gray-600">
                📧 Email: ufsbd34@ufsbd.fr
              </p>
              <p className="text-gray-600">
                📍 Hérault, France
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Pour toute information sur notre organisation ou nos missions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}