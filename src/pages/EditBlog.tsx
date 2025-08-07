import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TipTapEditor } from '@/components/TipTapEditor';
import { GallerySelector } from '@/components/GallerySelector';
import { GalleryService, type GalleryImage } from '@/lib/gallery';
import { useToast } from '@/hooks/use-toast';
import { PenTool, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { convertToPublicUrl } from '@/lib/utils';

export default function EditBlog() {
  const { id } = useParams<{ id: string }>();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    coverImage: '', // Changed from headerImage to coverImage
    coverImageUrl: '' // Changed from headerImageUrl to coverImageUrl
  });
  const [lockedCoverImage, setLockedCoverImage] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && !initialLoaded) {
      fetchPost(id);
    }
    // eslint-disable-next-line
  }, [id]);

  // Fix cover image display by converting raw path to public URL
  useEffect(() => {
    console.log('🔄 useEffect triggered - coverImage conversion check:');
    console.log('🔄 formData.coverImageUrl:', formData.coverImageUrl);
    console.log('🔄 formData.coverImage:', formData.coverImage);
    console.log('🔄 Should convert?', !formData.coverImageUrl && formData.coverImage);
    
    if (!formData.coverImageUrl && formData.coverImage) {
      console.log('✅ Converting cover image path to public URL...');
      const url = convertToPublicUrl(formData.coverImage);
      console.log('✅ Converted URL:', url);
      setFormData(prev => ({ ...prev, coverImageUrl: url }));
    } else {
      console.log('⏭️ Skipping conversion - conditions not met');
    }
  }, [formData.coverImage, formData.coverImageUrl]);

  const fetchPost = async (postId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      if (error || !data) {
        toast({ title: 'Erreur', description: "Impossible de charger l'article.", variant: 'destructive' });
        navigate('/admin/approved');
        return;
      }
      console.log('🔍 DEBUG - Loading post data:');
      console.log('🔍 Post ID:', data.id);
      console.log('🔍 Post title:', data.title);
      console.log('🔍 Post image field:', data.image);
      console.log('🔍 Post content length:', data.content?.length);
      
      setFormData({
        title: data.title || '',
        content: data.content || '',
        category: data.category || '',
        coverImage: data.image || '' // ← This is the COVER image from database
      });
      
      // 🔒 LOCK the cover image when loading from database
      if (data.image) {
        setLockedCoverImage(data.image);
        console.log('🔒 LOCKED cover image from database:', data.image);
      }
      
      console.log('🔍 DEBUG - FormData set with cover image:', data.image);
      setInitialLoaded(true);
    } catch (e) {
      toast({ title: 'Erreur', description: "Impossible de charger l'article.", variant: 'destructive' });
      navigate('/admin/approved');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverImageSelect = (image: GalleryImage) => {
    console.log('🎯 Selected cover image for edit:', image);
    console.log('🎯 Image URL:', image.url);
    console.log('🎯 Image file_path:', image.file_path);
    console.log('🎯 Image name:', image.name);
    
    // 🔒 LOCK the cover image IMMEDIATELY to prevent any overwriting
    setLockedCoverImage(image.file_path);
    console.log('🔒 LOCKED cover image IMMEDIATELY:', image.file_path);
    
    // Store the file_path for database, but use URL for immediate display
    setFormData(prev => {
      const newData = { 
        ...prev, 
        coverImage: image.file_path,    // ← Database path for cover image
        coverImageUrl: image.url        // ← Public URL for immediate display
      };
      console.log('🔄 Updated formData:', newData);
      console.log('🔄 Cover image path set to:', image.file_path);
      console.log('🔄 Cover image URL set to:', image.url);
      return newData;
    });
    
    console.log('✅ Cover image selected for edit');
  };

  // Convert file_path to public URL for display
  const getImageUrl = (filePath: string) => {
    return convertToPublicUrl(filePath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('🚀 Submitting form with cover image:', formData.coverImage);
    console.log('🚀 FormData state:', formData);
    
    try {
      // 🔒 FREEZE the cover image IMMEDIATELY to prevent any overwriting
      const lockedCoverImage = formData.coverImage;
      console.log('🔒 LOCKED cover image IMMEDIATELY:', lockedCoverImage);
      
      // Convert any temporary URLs in the content to public URLs (ONLY for content images)
      console.log('🔄 Before content processing - formData.coverImage:', formData.coverImage);
      const processedContent = await GalleryService.convertTemporaryUrlsInContent(formData.content);
      console.log('🔄 After content processing - formData.coverImage:', formData.coverImage);
      
      // 🔍 CRITICAL CHECK: Did content processing overwrite the cover image?
      const coverImageChanged = formData.coverImage !== lockedCoverImage;
      console.log('🔒 formData.coverImage changed?', coverImageChanged);
      if (coverImageChanged) {
        console.error('❌ CRITICAL BUG: formData.coverImage was overwritten!');
        console.error('❌ Original:', lockedCoverImage);
        console.error('❌ Current:', formData.coverImage);
      } else {
        console.log('✅ formData.coverImage was NOT overwritten');
      }
      
      console.log('🔍 DEBUG - Cover vs Content separation:');
      console.log('🔍 Cover image path:', formData.coverImage);
      console.log('🔍 Cover image URL:', formData.coverImageUrl);
      console.log('🔍 Content length:', formData.content?.length);
      console.log('🔍 Processed content length:', processedContent?.length);
      
      // Verify content doesn't contain cover image path
      if (processedContent && formData.coverImage) {
        const coverImageInContent = processedContent.includes(formData.coverImage);
        console.log('🔍 Cover image found in content?', coverImageInContent);
        if (coverImageInContent) {
          console.warn('⚠️ WARNING: Cover image path found in content!');
        }
      }
      
      // CRITICAL: Log exactly what we're saving
      console.log('💾 SAVING POST DATA:');
      console.log('💾 Cover image to save (LOCKED):', lockedCoverImage);
      console.log('💾 Cover image to save (current):', formData.coverImage);
      console.log('💾 Content to save:', processedContent);
      console.log('💾 Title to save:', formData.title);
      console.log('💾 Category to save:', formData.category);
      
      // 💾 FORCE the locked cover image - don't use formData.coverImage here!
      const finalCoverImage = lockedCoverImage || null; // Ensure null if empty
      console.log('💾 Final cover image for database:', finalCoverImage);
      
      const updateData = {
        title: formData.title,
        content: processedContent,
        category: formData.category,
        image: finalCoverImage  // 🚨 Use LOCKED cover image, not formData.coverImage!
      };
      
      console.log('💾 Final updateData object:', updateData);
      
      console.log('💾 Updating post with data:', updateData);
      console.log('💾 Post ID:', id);
      console.log('💾 Cover image being saved (LOCKED):', lockedCoverImage);
      
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select();
        
      if (error) {
        console.error('❌ Database update error:', error);
        console.error('❌ Error details:', error);
        throw error;
      }
      
      console.log('✅ Post updated successfully:', data);
      console.log('✅ Updated post data:', data);
      console.log('✅ Cover image saved (LOCKED):', lockedCoverImage);
      console.log('✅ Final post image field:', data?.[0]?.image);
      console.log('✅ Cover image matches?', data?.[0]?.image === lockedCoverImage);
      toast({ title: 'Article mis à jour !', description: 'Les modifications ont été enregistrées.' });
      navigate('/admin/approved');
    } catch (error) {
      console.error('❌ Error updating post:', error);
      toast({ title: 'Erreur', description: "Une erreur est survenue lors de la mise à jour.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'Prévention', label: '🛡️ Prévention' },
    { value: 'Soins', label: '🦷 Soins' },
    { value: 'Recherche', label: '🔬 Recherche' },
    { value: 'Formation', label: '🎓 Formation' },
    { value: 'Conseils', label: '💡 Conseils' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <Helmet>
        <title>Modifier l'article | UFSBD</title>
        <meta name="description" content="Modifier un article de blog UFSBD." />
      </Helmet>
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4 drop-shadow-lg flex items-center">
                <PenTool className="h-8 w-8 mr-2" /> Modifier l'article
              </h1>
              <p className="text-lg text-blue-100">Mettez à jour le contenu de votre article de blog.</p>
            </div>
            <Button asChild variant="outline" className="text-black border-white hover:bg-white hover:text-blue-600">
              <Link to="/admin/approved">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Modifier l'article</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={value => handleInputChange('category', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contenu</Label>
                <TipTapEditor
                  value={formData.content}
                  onChange={value => handleInputChange('content', value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Image de couverture (optionnel)</Label>
                <div className="flex items-center gap-4">
                  {/* Always show preview if there's a cover image */}
                  {(formData.coverImage || formData.coverImageUrl) && (
                    <div className="relative">
                      <img
                        src={formData.coverImageUrl || convertToPublicUrl(formData.coverImage)}
                        alt="Image de couverture"
                        className="w-32 h-20 object-cover rounded-md border"
                        onLoad={() => {
                          console.log('✅ Edit cover image loaded successfully');
                          console.log('✅ Image src used:', formData.coverImageUrl || convertToPublicUrl(formData.coverImage));
                          console.log('✅ Cover image URL:', formData.coverImageUrl);
                          console.log('✅ Cover image path:', formData.coverImage);
                        }}
                        onError={(e) => {
                          console.error('❌ Edit cover image failed:', formData.coverImageUrl || formData.coverImage, e);
                          console.error('❌ Failed image src:', formData.coverImageUrl || convertToPublicUrl(formData.coverImage));
                        }}
                      />
                      <p className="text-xs text-blue-500 mt-1">
                        Debug: coverImageUrl={formData.coverImageUrl}, coverImage={formData.coverImage}
                      </p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => {
                          handleInputChange('coverImage', '');
                          handleInputChange('coverImageUrl', '');
                        }}
                      >
                        ×
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Cover: {formData.coverImage}
                        {formData.coverImageUrl && ' (IMMEDIATE UPDATE)'}
                      </p>
                    </div>
                  )}
                  {/* Show placeholder if no cover image */}
                  {!formData.coverImage && !formData.coverImageUrl && (
                    <div className="w-32 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                      <p className="text-xs text-gray-500">No cover image</p>
                    </div>
                  )}
                  <GallerySelector 
                    onImageSelect={handleCoverImageSelect}
                    title="Sélectionner une image de couverture"
                    description="Choisissez une image pour la couverture de cet article"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-black !text-black" style={{ color: 'black' }} disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 