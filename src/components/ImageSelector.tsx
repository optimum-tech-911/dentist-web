import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Image, Search, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GalleryService, type GalleryImage } from '@/lib/gallery';

interface ImageSelectorProps {
  selectedImageId?: string | null;
  onImageSelect: (imageId: string | null) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

export function ImageSelector({ 
  selectedImageId, 
  onImageSelect, 
  trigger,
  title = "Sélectionner une image",
  description = "Choisissez une image depuis la galerie"
}: ImageSelectorProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedImageId && images.length > 0) {
      const image = images.find(img => img.id === selectedImageId);
      setSelectedImage(image || null);
    }
  }, [selectedImageId, images]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const fetchedImages = await GalleryService.getImages();
      setImages(fetchedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images de la galerie.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageSelect = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onImageSelect(selectedImage.id);
      toast({
        title: "Image sélectionnée",
        description: `${selectedImage.name} a été sélectionnée.`
      });
    } else {
      onImageSelect(null);
      toast({
        title: "Aucune image",
        description: "Aucune image n'a été sélectionnée."
      });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedImage(null);
    onImageSelect(null);
    toast({
      title: "Image supprimée",
      description: "L'image a été supprimée."
    });
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <Image className="h-4 w-4 mr-2" />
      {selectedImage ? selectedImage.name : "Sélectionner une image"}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une image..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-green-800">Image sélectionnée</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Sélectionnée
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{selectedImage.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {GalleryService.formatFileSize(selectedImage.file_size)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Images Grid */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Chargement des images...</span>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {searchTerm ? 'Aucune image trouvée.' : 'Aucune image dans la galerie.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredImages.map((image) => (
                  <Card
                    key={image.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedImage?.id === image.id
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {selectedImage?.id === image.id && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium truncate" title={image.name}>
                        {image.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {GalleryService.formatFileSize(image.file_size)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            {selectedImage && (
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
            <Button onClick={handleConfirm}>
              {selectedImage ? 'Confirmer' : 'Aucune image'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 