import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type OrganigramMember = Database['public']['Tables']['organigram_members']['Row'] & {
  image?: {
    url: string;
    name: string;
  };
};

export type OrganigramRole = 
  | 'president'
  | 'secretaire'
  | 'secretaireAdjoint'
  | 'tresorier'
  | 'tresorierAdjoint'
  | 'vicePresidents'
  | 'chargesMission'
  | 'verificateur';

export class OrganigramService {
  /**
   * Get all organigram members
   */
  static async getMembers(): Promise<OrganigramMember[]> {
    try {
      const { data, error } = await supabase
        .from('organigram_members')
        .select(`
          *,
          image:gallery_images(id, name, file_path)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Get signed URLs for images
      const membersWithImages = await Promise.all(
        data.map(async (member) => {
          if (member.image && member.image.file_path) {
            const { data: urlData } = await supabase.storage
              .from('gallery')
              .createSignedUrl(member.image.file_path, 3600);

            return {
              ...member,
              image: {
                url: urlData?.signedUrl || '',
                name: member.image.name
              }
            };
          }
          return member;
        })
      );

      return membersWithImages;

    } catch (error) {
      console.error('Error fetching organigram members:', error);
      throw error;
    }
  }

  /**
   * Get a single member by ID
   */
  static async getMemberById(id: string): Promise<OrganigramMember | null> {
    try {
      const { data, error } = await supabase
        .from('organigram_members')
        .select(`
          *,
          image:gallery_images(id, name, file_path)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Get signed URL for image
      if (data.image && data.image.file_path) {
        const { data: urlData } = await supabase.storage
          .from('gallery')
          .createSignedUrl(data.image.file_path, 3600);

        return {
          ...data,
          image: {
            url: urlData?.signedUrl || '',
            name: data.image.name
          }
        };
      }

      return data;

    } catch (error) {
      console.error('Error fetching organigram member:', error);
      throw error;
    }
  }

  /**
   * Create a new member
   */
  static async createMember(memberData: {
    name: string;
    title: string;
    role: OrganigramRole;
    image_id?: string;
    description?: string;
    members?: string[];
    color?: string;
    order_index?: number;
  }, userId: string): Promise<OrganigramMember> {
    try {
      const { data, error } = await supabase
        .from('organigram_members')
        .insert({
          ...memberData,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error creating organigram member:', error);
      throw error;
    }
  }

  /**
   * Update a member
   */
  static async updateMember(id: string, updates: {
    name?: string;
    title?: string;
    role?: OrganigramRole;
    image_id?: string | null;
    description?: string;
    members?: string[];
    color?: string;
    order_index?: number;
    is_active?: boolean;
  }): Promise<OrganigramMember> {
    try {
      const { data, error } = await supabase
        .from('organigram_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error updating organigram member:', error);
      throw error;
    }
  }

  /**
   * Delete a member
   */
  static async deleteMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('organigram_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

    } catch (error) {
      console.error('Error deleting organigram member:', error);
      throw error;
    }
  }

  /**
   * Update member image
   */
  static async updateMemberImage(memberId: string, imageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('organigram_members')
        .update({ image_id: imageId })
        .eq('id', memberId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating member image:', error);
      throw error;
    }
  }

  /**
   * Upload an image to Supabase storage and insert metadata into gallery_images
   */
  static async uploadImage(file: File, memberId: string): Promise<{ id: string } | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');
      const filePath = `${user.id}/${memberId}_${file.name}`;
      // Upload to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, { upsert: true });
      if (storageError) throw storageError;
      // Insert metadata into gallery_images
      const { data: imageData, error: imageError } = await supabase
        .from('gallery_images')
        .insert({
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
        })
        .select('id')
        .single();
      if (imageError) throw imageError;
      return imageData;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  /**
   * Get available roles
   */
  static getAvailableRoles(): { value: OrganigramRole; label: string; description: string }[] {
    return [
      { value: 'president', label: 'Président', description: 'Co-présidents de l\'organisation' },
      { value: 'secretaire', label: 'Secrétaire', description: 'Secrétaire générale' },
      { value: 'secretaireAdjoint', label: 'Secrétaire Adjoint', description: 'Secrétaire général adjoint' },
      { value: 'tresorier', label: 'Trésorier', description: 'Trésorier principal' },
      { value: 'tresorierAdjoint', label: 'Trésorier Adjoint', description: 'Trésorier adjoint' },
      { value: 'vicePresidents', label: 'Vice-présidents', description: 'Vice-présidents' },
      { value: 'chargesMission', label: 'Chargés de Mission', description: 'Chargés de mission' },
      { value: 'verificateur', label: 'Vérificateur', description: 'Vérificateur aux comptes' }
    ];
  }

  /**
   * Get role label
   */
  static getRoleLabel(role: OrganigramRole): string {
    const roleData = this.getAvailableRoles().find(r => r.value === role);
    return roleData?.label || role;
  }

  /**
   * Get role description
   */
  static getRoleDescription(role: OrganigramRole): string {
    const roleData = this.getAvailableRoles().find(r => r.value === role);
    return roleData?.description || '';
  }

  /**
   * Get default color for role
   */
  static getDefaultColor(role: OrganigramRole): string {
    const colorMap: Record<OrganigramRole, string> = {
      president: 'from-blue-600 to-blue-700',
      secretaire: 'from-blue-500 to-blue-600',
      secretaireAdjoint: 'from-cyan-500 to-cyan-600',
      tresorier: 'from-teal-500 to-teal-600',
      tresorierAdjoint: 'from-green-500 to-green-600',
      vicePresidents: 'from-purple-500 to-purple-600',
      chargesMission: 'from-red-500 to-red-600',
      verificateur: 'from-orange-500 to-orange-600'
    };
    return colorMap[role] || 'from-blue-500 to-blue-600';
  }
} 