import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Upload, Trash2, Eye, X, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GalleryService, type GalleryImage } from '@/lib/gallery';

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const images = await GalleryService.getImages();
      setImages(images);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour télécharger des images.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        const validation = GalleryService.validateFile(file);
        if (!validation.isValid) {
          toast({
            title: "Erreur",
            description: validation.error,
            variant: "destructive"
          });
          continue;
        }

        // Upload image using service
        const uploadedImage = await GalleryService.uploadImage(file, user.id);
        
        if (uploadedImage) {
          toast({
            title: "Succès",
            description: `${file.name} a été téléchargé avec succès.`
          });
        }
      }

      // Refresh the image list
      await fetchImages();

    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: string, filePath: string) => {
    try {
      await GalleryService.deleteImage(imageId, filePath);

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée de la galerie."
      });

      // Close modal if it's open
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }

    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    return GalleryService.formatFileSize(bytes);
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiée",
      description: "L'URL de l'image a été copiée dans le presse-papiers."
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Gestion de la Galerie</h1>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Chargement de la galerie...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Gestion de la Galerie</h1>
        </div>
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{isUploading ? 'Téléchargement...' : 'Télécharger des images'}</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galerie d'Images ({images.length} image(s))</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune image téléchargée. Cliquez sur "Télécharger des images" pour commencer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden group">
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id, image.file_path)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate" title={image.name}>
                      {image.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.file_size)}
                    </p>
                    <div className="flex space-x-1 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyImageUrl(image.url)}
                        className="flex-1"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Copier URL
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedImage.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-[60vh] object-contain mx-auto"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p><strong>Taille:</strong> {formatFileSize(selectedImage.file_size)}</p>
                <p><strong>Type:</strong> {selectedImage.file_type}</p>
                <p><strong>Date:</strong> {selectedImage.created_at ? new Date(selectedImage.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={() => copyImageUrl(selectedImage.url)}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Copier URL
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteImage(selectedImage.id, selectedImage.file_path);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}