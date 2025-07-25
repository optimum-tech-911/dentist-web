import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Users, Loader2, Image, Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { OrganigramService, type OrganigramMember, type OrganigramRole } from '@/lib/organigram';
import { ImageSelector } from '@/components/ImageSelector';

export default function OrganigrammeAdmin() {
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [members, setMembers] = useState<OrganigramMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Partial<OrganigramMember>>({
    name: '',
    title: '',
    role: 'secretaire',
    description: '',
    members: [],
    color: 'from-blue-500 to-blue-600'
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Check if user has permission
  const hasPermission = userRole === 'admin' || userRole === 'doctor';

  useEffect(() => {
    if (hasPermission) {
      fetchMembers();
    }
  }, [hasPermission]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const fetchedMembers = await OrganigramService.getMembers();
      setMembers(fetchedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de l'organigramme.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: OrganigramMember) => {
    setEditingId(member.id);
  };

  const handleSave = async (id: string, updatedData: Partial<OrganigramMember>) => {
    try {
      await OrganigramService.updateMember(id, updatedData);
      await fetchMembers(); // Refresh the list
      
      setEditingId(null);
      toast({
        title: "Membre mis à jour",
        description: "Les informations ont été sauvegardées avec succès."
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (member && ['president', 'secretaire', 'tresorier'].includes(member.role)) {
      toast({
        title: "Suppression impossible",
        description: "Les postes du bureau exécutif ne peuvent pas être supprimés.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await OrganigramService.deleteMember(id);
      await fetchMembers(); // Refresh the list
      
      toast({
        title: "Membre supprimé",
        description: "Le membre a été retiré de l'organigramme."
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le membre.",
        variant: "destructive"
      });
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.title || !user) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le nom et le titre.",
        variant: "destructive"
      });
      return;
    }

    try {
      await OrganigramService.createMember({
        name: newMember.name,
        title: newMember.title,
        role: newMember.role as OrganigramRole,
        image_id: newMember.image_id,
        description: newMember.description,
        members: newMember.members,
        color: newMember.color,
        order_index: members.length + 1
      }, user.id);
      
      await fetchMembers(); // Refresh the list
      
      setNewMember({
        name: '',
        title: '',
        role: 'secretaire',
        description: '',
        members: [],
        color: 'from-blue-500 to-blue-600'
      });
      setShowAddForm(false);
      
      toast({
        title: "Membre ajouté",
        description: "Le nouveau membre a été ajouté avec succès."
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le membre.",
        variant: "destructive"
      });
    }
  };

  const handleImageSelect = async (memberId: string, imageId: string | null) => {
    try {
      if (imageId) {
        await OrganigramService.updateMemberImage(memberId, imageId);
      } else {
        await OrganigramService.updateMember(memberId, { image_id: null });
      }
      await fetchMembers(); // Refresh the list
      
      toast({
        title: "Image mise à jour",
        description: "L'image du membre a été mise à jour."
      });
    } catch (error) {
      console.error('Error updating member image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'image.",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    return OrganigramService.getRoleLabel(role as OrganigramRole);
  };

  const getRoleDescription = (role: string) => {
    return OrganigramService.getRoleDescription(role as OrganigramRole);
  };

  const availableRoles = OrganigramService.getAvailableRoles();

  // Add moveMember function
  const moveMember = async (id: string, direction: 'up' | 'down') => {
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= members.length) return;
    // Swap order_index values
    const memberA = members[index];
    const memberB = members[newIndex];
    await OrganigramService.updateMember(memberA.id, { order_index: newIndex + 1 });
    await OrganigramService.updateMember(memberB.id, { order_index: index + 1 });
    await fetchMembers();
  };

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Gestion de l'Organigramme</h1>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions nécessaires pour gérer l'organigramme.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Gestion de l'Organigramme</h1>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Chargement de l'organigramme...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const EditForm = ({ member }: { member: OrganigramMember }) => {
    const [formData, setFormData] = useState({
      name: member.name,
      title: member.title,
      role: member.role,
      description: member.description || '',
      members: member.members || [],
      color: member.color || OrganigramService.getDefaultColor(member.role as OrganigramRole)
    });

    const handleInputChange = (field: string, value: string | string[]) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = () => {
      handleSave(member.id, formData);
    };

    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg">Modifier le membre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nom du membre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Titre du poste"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>

          <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du poste ou des responsabilités"
              rows={3}
                />
              </div>

          <div className="space-y-2">
            <Label>Image de profil</Label>
            <ImageSelector
              selectedImageId={member.image_id}
              onImageSelect={(imageId) => handleImageSelect(member.id, imageId)}
              title="Sélectionner une image de profil"
              description="Choisissez une image depuis la galerie pour ce membre"
                />
              </div>

          <div className="flex space-x-2">
            <Button onClick={handleSubmit} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Gestion de l'Organigramme</h1>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Ajouter un membre</span>
        </Button>
      </div>

      {/* Add New Member Form */}
      {showAddForm && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Ajouter un nouveau membre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newName">Nom</Label>
                <Input
                  id="newName"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du membre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTitle">Titre</Label>
                <Input
                  id="newTitle"
                  value={newMember.title}
                  onChange={(e) => setNewMember(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre du poste"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newRole">Rôle</Label>
              <Select
                value={newMember.role} 
                onValueChange={(value) => setNewMember(prev => ({ 
                  ...prev, 
                  role: value as OrganigramRole,
                  color: OrganigramService.getDefaultColor(value as OrganigramRole)
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDescription">Description</Label>
              <Textarea
                id="newDescription"
                value={newMember.description}
                onChange={(e) => setNewMember(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du poste ou des responsabilités"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Image de profil</Label>
              <ImageSelector
                selectedImageId={newMember.image_id}
                onImageSelect={(imageId) => setNewMember(prev => ({ ...prev, image_id: imageId }))}
                title="Sélectionner une image de profil"
                description="Choisissez une image depuis la galerie pour ce membre"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddMember} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le membre
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <div className="grid gap-6">
        {members.map((member, index) => (
          <div key={member.id}>
            {editingId === member.id ? (
              <EditForm member={member} />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                        {member.image?.url ? (
                          <img
                            src={member.image.url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{member.name}</CardTitle>
                        <p className="text-muted-foreground">{member.title}</p>
                        <Badge variant="secondary" className="mt-1">
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {(userRole === 'admin' || userRole === 'doctor') && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => moveMember(member.id, 'up')}
                            title="Monter"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === members.length - 1}
                            onClick={() => moveMember(member.id, 'down')}
                            title="Descendre"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      {!['president', 'secretaire', 'tresorier'].includes(member.role) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {member.description && (
                  <CardContent>
                    <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
                )}
              </Card>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Aucun membre dans l'organigramme. Ajoutez le premier membre.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}