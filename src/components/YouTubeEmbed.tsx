import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, X } from 'lucide-react';

interface YouTubeEmbedProps {
  onVideoSelect: (embedCode: string, videoUrl: string) => void;
  trigger?: React.ReactNode;
}

export function YouTubeEmbed({ onVideoSelect, trigger }: YouTubeEmbedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const generateEmbedCode = (videoId: string): string => {
    return `<div class="youtube-embed">
  <iframe 
    width="100%" 
    height="400" 
    src="https://www.youtube.com/embed/${videoId}" 
    title="YouTube video player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>`;
  };

  const handleSubmit = () => {
    setError('');
    
    if (!videoUrl.trim()) {
      setError('Veuillez entrer une URL YouTube valide.');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('URL YouTube invalide. Veuillez vérifier le format.');
      return;
    }

    const embedCode = generateEmbedCode(videoId);
    onVideoSelect(embedCode, videoUrl);
    setIsOpen(false);
    setVideoUrl('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <Play className="h-4 w-4" />
      Ajouter une vidéo YouTube
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une vidéo YouTube</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL de la vidéo YouTube</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Formats supportés :</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>https://youtu.be/VIDEO_ID</li>
              <li>https://youtube.com/embed/VIDEO_ID</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              Ajouter la vidéo
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 