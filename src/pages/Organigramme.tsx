import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Award, Building2, Heart, BookOpen, Shield, Crown, UserCog } from 'lucide-react';
import { OrganigramService, type OrganigramMember } from '@/lib/organigram';
import { OrganigrammeCard } from '@/components/OrganigrammeCard';

export default function Organigramme() {
  const [orgData, setOrgData] = useState<OrganigramMember[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          
          {/* Image or Icon */}
          <div className="relative z-10 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-white/30">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
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
                <OrganigrammeCard member={president} onUpdated={fetchOrgData} editable={true} />
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
                <OrganigrammeCard key={member.id} member={member} onUpdated={fetchOrgData} editable={true} />
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
                <OrganigrammeCard key={member.id} member={member} onUpdated={fetchOrgData} editable={true} />
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
                <OrganigrammeCard key={member.id} member={member} onUpdated={fetchOrgData} editable={true} />
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