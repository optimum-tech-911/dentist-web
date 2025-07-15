import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Search, X, Check, Loader2 } from 'lucide-react';
import { GalleryService, type GalleryImage } from '@/lib/gallery';
import { useToast } from '@/hooks/use-toast';

interface GallerySelectorProps {
  onImageSelect: (image: GalleryImage) => void; // Will handle both images and videos
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

export function GallerySelector({ 
  onImageSelect, 
  trigger, 
  title = "Sélectionner une image",
  description = "Choisissez une image depuis la galerie"
}: GallerySelectorProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredImages(images);
    } else {
      const filtered = images.filter(image =>
        image.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredImages(filtered);
    }
  }, [searchTerm, images]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const images = await GalleryService.getImages();
      setImages(images);
      setFilteredImages(images);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images de la galerie.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (media: GalleryImage) => {
    onImageSelect(media);
    setIsOpen(false);
    setSearchTerm('');
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <Image className="h-4 w-4" />
      Sélectionner une image
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-blue-600 mt-2">Seuls les fichiers jusqu'à 50MB sont acceptés (images ou vidéos).</p>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4">
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

          {/* Images Grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Chargement des images...</p>
                </div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {searchTerm ? 'Aucune image trouvée.' : 'Aucune image dans la galerie.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((media) => (
                  <Card 
                    key={media.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => handleImageSelect(media)}
                  >
                    <CardContent className="p-2">
                      <div className="relative aspect-square overflow-hidden rounded-md bg-black">
                        {media.file_type.startsWith('image/') ? (
                          <img
                            src={media.url}
                            alt={media.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : media.file_type.startsWith('video/') ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Check className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium truncate" title={media.name}>
                          {media.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {GalleryService.formatFileSize(media.file_size)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 