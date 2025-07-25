import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { OrganigramMember, OrganigramRole } from '@/lib/organigram';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OrganigramService } from '@/lib/organigram';

interface OrganigrammeCardProps {
  member: OrganigramMember;
  onUpdated?: () => void;
  editable?: boolean;
}

export function OrganigrammeCard({ member, onUpdated, editable }: OrganigrammeCardProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: member.name || '',
    role: member.role as OrganigramRole,
    imageFile: null as File | null,
    imageUrl: member.image?.url || member.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setForm({ ...form, role: value as OrganigramRole });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, imageFile: file, imageUrl: file ? URL.createObjectURL(file) : (member.image?.url || member.image_url || '') });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let image_id = member.image_id;
      // If a new image is selected, upload it
      if (form.imageFile) {
        // Upload to Supabase storage (gallery bucket, path: `${member.id}/${file.name}`)
        const result = await OrganigramService.uploadImage(form.imageFile, member.id);
        if (!result) throw new Error('Failed to upload image');
        image_id = result.id;
        // Update member image_id
        await OrganigramService.updateMemberImage(member.id, image_id);
      }
      // Update member fields
      await OrganigramService.updateMember(member.id, {
        name: form.name,
        role: form.role,
        image_id,
      });
      setOpen(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  // Get the current image URL (handle both old and new data structures)
  const currentImageUrl = member.image?.url || member.image_url || '';

  // Get role-based color for the card
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

  return (
    <Card className={`h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 ${getRoleColor(member.role)} text-white overflow-hidden`}>
      <CardHeader className="text-center pb-4 relative">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative z-10 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-white/30">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load image:', currentImageUrl);
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', currentImageUrl);
              }}
            />
          ) : null}
          <Users className={`h-10 w-10 text-white ${currentImageUrl ? 'hidden' : ''}`} />
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2 shadow-lg">
          {member.title}
        </Badge>
        <CardTitle className="text-xl text-white drop-shadow-lg font-bold">
          {member.name}
        </CardTitle>
        {editable && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="absolute top-2 right-2 z-20">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Member</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div>
                  <label className="block mb-1 text-sm">Image</label>
                  <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} />
                  {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full mx-auto" />}
                </div>
                <div>
                  <label className="block mb-1 text-sm">Name</label>
                  <Input name="name" value={form.name} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Role</label>
                  <Select value={form.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {OrganigramService.getAvailableRoles().map(role => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="text-center relative z-10">
        {member.description && (
          <p className="text-white/95 text-sm leading-relaxed mb-2 drop-shadow-md">
            {member.description}
          </p>
        )}
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
}