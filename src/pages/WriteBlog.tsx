import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PenTool, Send, ArrowLeft, Info, BookOpen, Heart, Users } from 'lucide-react';

export default function WriteBlog() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const categories = [
    { value: 'prevention', label: '🛡️ Prévention', description: 'Conseils et mesures préventives' },
    { value: 'actualites', label: '📰 Actualités', description: 'Nouvelles et événements' },
    { value: 'recherche', label: '🔬 Recherche', description: 'Études et découvertes' },
    { value: 'formation', label: '🎓 Formation', description: 'Éducation et apprentissage' },
    { value: 'conseils', label: '💡 Conseils', description: 'Recommandations pratiques' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour publier un article.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          author_email: user.email,
          author_id: user.id,
          image: formData.image || null,
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
        content: '',
        category: '',
        image: ''
      });

      setShowSubmitDialog(false);
    } catch (error) {
      console.error('Error submitting post:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre article.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg text-blue-800">Processus</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  Votre article sera examiné par notre équipe avant publication pour garantir la qualité du contenu.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg text-green-800">Contenu</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Privilégiez les informations vérifiées et les conseils pratiques pour nos lecteurs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg text-purple-800">Communauté</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-700">
                  Contribuez à la sensibilisation et à l'éducation en santé bucco-dentaire.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">Rédiger votre article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">


              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'article *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Donnez un titre accrocheur à votre article..."
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                          <span className="text-xs text-muted-foreground">{cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image">URL de l'image (optionnel)</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Ajoutez une image d'illustration pour votre article
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Contenu de l'article *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Rédigez votre article ici... Vous pouvez utiliser le format Markdown pour la mise en forme."
                  className="min-h-[300px] resize-y"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Utilisez Markdown pour la mise en forme (gras: **texte**, italique: *texte*, liens: [texte](url))
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  * Champs obligatoires
                </p>
                
                <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8"
                      disabled={!formData.title || !formData.content || !formData.category}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Soumettre l'article
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la soumission</AlertDialogTitle>
                      <AlertDialogDescription>
                        Votre article "{formData.title}" sera envoyé pour validation. 
                        Il apparaîtra sur le blog après approbation par notre équipe.
                        Êtes-vous sûr de vouloir le soumettre ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Envoi...' : 'Confirmer'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Conseils pour un bon article
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Titre clair :</strong> Utilisez un titre qui décrit précisément le contenu</li>
                <li>• <strong>Structure :</strong> Organisez votre contenu avec des paragraphes et sous-titres</li>
                <li>• <strong>Sources :</strong> Citez vos sources si vous mentionnez des études ou statistiques</li>
                <li>• <strong>Accessibilité :</strong> Écrivez dans un langage accessible à tous</li>
                <li>• <strong>Relecture :</strong> Vérifiez l'orthographe et la grammaire avant de soumettre</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}