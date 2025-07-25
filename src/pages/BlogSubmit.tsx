import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { PenTool, Image, ArrowLeft } from 'lucide-react';
import { TipTapEditor } from '@/components/TipTapEditor';
import { GallerySelector } from '@/components/GallerySelector';
import { GalleryService, type GalleryImage } from '@/lib/gallery';

export default function BlogSubmit() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    headerImage: ''
  });

  // Role check is now handled by ProtectedRoute component

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
              const { error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          image: formData.headerImage || null,
          author_email: user.email!,
          author_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Article soumis !",
        description: "Votre article a été envoyé pour validation. Il apparaîtra dans la section blog après approbation."
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        content: '',
        headerImage: ''
      });

    } catch (error) {
      console.error('Error submitting post:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre article.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Prévention',
    'Soins',
    'Recherche',
    'Formation',
    'Actualités'
  ];

  // Handle header image selection
  const handleHeaderImageSelect = (image: GalleryImage) => {
    setFormData(prev => ({
      ...prev,
      headerImage: image.url
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4 drop-shadow-lg flex items-center">
                <PenTool className="mr-4 h-10 w-10" />
                Écrire un Article
              </h1>
              <p className="text-xl text-blue-100 drop-shadow-md">
                Partagez vos connaissances sur la santé bucco-dentaire
              </p>
            </div>
            <Button variant="outline" asChild className="text-blue-600 hover:bg-blue-50">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">Rédiger votre article</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'article *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Donnez un titre accrocheur à votre article..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                              {/* Header Image Selection */}
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
                        onClick={() => setFormData(prev => ({ ...prev, headerImage: '' }))}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  <GallerySelector
                    onImageSelect={handleHeaderImageSelect}
                    trigger={
                      <Button type="button" variant="outline" className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        {formData.headerImage ? 'Changer l\'image' : 'Sélectionner une image'}
                      </Button>
                    }
                    title="Sélectionner une image de couverture"
                    description="Choisissez une image depuis la galerie pour l'utiliser comme image de couverture de votre article"
                  />
                </div>
              </div>

              {/* Rich Text Editor for Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Contenu de l'article *</Label>
                <TipTapEditor
                  value={formData.content}
                  onChange={(value) => setFormData({...formData, content: value})}
                  placeholder="Rédigez le contenu de votre article ici... Utilisez la barre d'outils pour formater le texte et insérer des images ou vidéos."
                />
              </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Envoi en cours...' : 'Soumettre pour révision'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}