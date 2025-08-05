import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { convertToPublicUrl } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { GalleryService, type GalleryImage } from '@/lib/gallery';

export default function ImageTester() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const fetchedImages = await GalleryService.getImages();
        setImages(fetchedImages.slice(0, 3)); // Get first 3 images
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const testCases = [
    {
      name: 'Raw path test',
      input: 'gallery/test-image.png',
      expected: 'Should return as-is'
    },
    {
      name: 'Signed URL test',
      input: 'https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/sign/gallery/2b588d0d-b1d6-430d-adea-f7cd264547ff/1752426075047-6u2smzuykrw.jpg?token=abc123',
      expected: 'Should convert to public URL'
    },
    {
      name: 'Public URL test',
      input: 'https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/2b588d0d-b1d6-430d-adea-f7cd264547ff/1752426075047-6u2smzuykrw.jpg',
      expected: 'Should return as-is (idempotent)'
    },
    {
      name: 'Broken image test',
      input: 'gallery/nonexistent-image.png',
      expected: 'Should show placeholder'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Image Tester</h1>
          <p className="text-muted-foreground">
            Testing convertToPublicUrl() functionality and image loading with fallbacks
          </p>
        </div>

        {/* Real Images from Supabase */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Real Images from Supabase</CardTitle>
            <p className="text-sm text-muted-foreground">
              Testing with actual images from the gallery
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading images...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="space-y-2">
                    <div className="aspect-square relative border rounded-lg overflow-hidden">
                      <img
                        src={convertToPublicUrl(image.url)}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn('Image failed to load:', e.currentTarget.src);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-medium truncate">{image.name}</p>
                      <p className="text-muted-foreground">Original: {image.url.substring(0, 50)}...</p>
                      <p className="text-muted-foreground">Converted: {convertToPublicUrl(image.url).substring(0, 50)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>convertToPublicUrl() Test Cases</CardTitle>
            <p className="text-sm text-muted-foreground">
              Testing various URL formats and edge cases
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{testCase.name}</Badge>
                  </div>
                  <div className="aspect-square relative border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={convertToPublicUrl(testCase.input)}
                      alt={testCase.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('Image failed to load:', e.currentTarget.src);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Input:</p>
                    <p className="text-muted-foreground break-all">{testCase.input}</p>
                    <p className="font-medium">Expected:</p>
                    <p className="text-muted-foreground">{testCase.expected}</p>
                    <p className="font-medium">Output:</p>
                    <p className="text-muted-foreground break-all">{convertToPublicUrl(testCase.input)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* URL Conversion Debug */}
        <Card>
          <CardHeader>
            <CardTitle>URL Conversion Debug</CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time testing of convertToPublicUrl()
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Test URL:</label>
                <input
                  type="text"
                  placeholder="Enter a URL to test..."
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => {
                    const converted = convertToPublicUrl(e.target.value);
                    console.log('Input:', e.target.value);
                    console.log('Converted:', converted);
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Check browser console for conversion results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}