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
    headerImage: ''
  });
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && !initialLoaded) {
      fetchPost(id);
    }
    // eslint-disable-next-line
  }, [id]);

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
      setFormData({
        title: data.title || '',
        content: data.content || '',
        category: data.category || '',
        headerImage: data.image || ''
      });
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

  const handleHeaderImageSelect = (image: GalleryImage) => {
    setFormData(prev => ({ ...prev, headerImage: image.url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          image: formData.headerImage || null
        })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Article mis à jour !', description: 'Les modifications ont été enregistrées.' });
      navigate('/admin/approved');
    } catch (error) {
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
            <Button asChild variant="outline" className="text-white border-white">
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
                  {formData.headerImage && (
                    <div className="relative">
                      <img
                        src={formData.headerImage}
                        alt="Image de couverture"
                        className="w-32 h-20 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => handleInputChange('headerImage', '')}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  <GallerySelector onImageSelect={handleHeaderImageSelect} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 