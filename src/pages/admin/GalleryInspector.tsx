import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  HardDrive,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GalleryService, type GalleryImage } from '@/lib/gallery';
import { convertToPublicUrl } from '@/lib/utils';
import { checkGalleryHealth, quickHealthCheck } from '@/lib/gallery-health-check';
import { detectOrphanedFiles, getStorageStats } from '@/lib/storage-cleaner';

interface ImageStatus {
  image: GalleryImage;
  publicUrl: string;
  status: 'loading' | 'working' | 'broken' | 'error';
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

export default function GalleryInspector() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthCheckResult, setHealthCheckResult] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [orphanedFiles, setOrphanedFiles] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const fetchedImages = await GalleryService.getImages();
      setImages(fetchedImages);
      
      // Initialize status checks
      const statuses: ImageStatus[] = fetchedImages.map(image => ({
        image,
        publicUrl: convertToPublicUrl(image.url),
        status: 'loading'
      }));
      setImageStatuses(statuses);
      
      // Check each image status
      await checkImageStatuses(statuses);
      
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkImageStatuses = async (statuses: ImageStatus[]) => {
    const updatedStatuses = await Promise.all(
      statuses.map(async (status) => {
        const startTime = Date.now();
        
        try {
          const response = await fetch(status.publicUrl, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            return { ...status, status: 'working' as const, responseTime };
          } else {
            return { 
              ...status, 
              status: 'broken' as const, 
              statusCode: response.status,
              responseTime 
            };
          }
        } catch (error) {
          return { 
            ...status, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: Date.now() - startTime
          };
        }
      })
    );
    
    setImageStatuses(updatedStatuses);
  };

  const runHealthCheck = async () => {
    try {
      const result = await checkGalleryHealth();
      setHealthCheckResult(result);
      toast({
        title: "Health Check Complete",
        description: `${result.brokenImages.length} broken images found.`
      });
    } catch (error) {
      toast({
        title: "Health Check Failed",
        description: "Error running health check.",
        variant: "destructive"
      });
    }
  };

  const getStorageInfo = async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
      
      const orphaned = await detectOrphanedFiles();
      setOrphanedFiles(orphaned);
      
      toast({
        title: "Storage Analysis Complete",
        description: `${orphaned.orphanedFiles.length} orphaned files found.`
      });
    } catch (error) {
      toast({
        title: "Storage Analysis Failed",
        description: "Error analyzing storage.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'broken': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working': return <Badge variant="default" className="bg-green-100 text-green-800">Working</Badge>;
      case 'broken': return <Badge variant="destructive">Broken</Badge>;
      case 'error': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Error</Badge>;
      default: return <Badge variant="outline">Loading</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading gallery inspector...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Gallery Inspector</h1>
          <p className="text-muted-foreground">
            Debug tool for gallery images and storage analysis
          </p>
        </div>

        <Tabs defaultValue="images" className="space-y-6">
          <TabsList>
            <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
            <TabsTrigger value="health">Health Check</TabsTrigger>
            <TabsTrigger value="storage">Storage Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gallery Images</CardTitle>
                  <Button onClick={fetchImages} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageStatuses.map((status, index) => (
                    <Card key={status.image.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={status.publicUrl}
                          alt={status.image.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          {getStatusIcon(status.status)}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate" title={status.image.name}>
                              {status.image.name}
                            </p>
                            {getStatusBadge(status.status)}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>ID: {status.image.id}</p>
                            <p>Path: {status.image.file_path}</p>
                            <p>Size: {GalleryService.formatFileSize(status.image.file_size)}</p>
                            {status.responseTime && (
                              <p>Response: {status.responseTime}ms</p>
                            )}
                            {status.statusCode && (
                              <p>Status: {status.statusCode}</p>
                            )}
                            {status.error && (
                              <p className="text-red-600">Error: {status.error}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Health Check</CardTitle>
                  <Button onClick={runHealthCheck} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Check
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {healthCheckResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{healthCheckResult.totalImages}</p>
                        <p className="text-sm text-blue-600">Total Images</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{healthCheckResult.workingImages.length}</p>
                        <p className="text-sm text-green-600">Working</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{healthCheckResult.brokenImages.length}</p>
                        <p className="text-sm text-red-600">Broken</p>
                      </div>
                    </div>
                    
                    {healthCheckResult.brokenImages.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium">Broken Images Found:</p>
                          <ul className="mt-2 space-y-1">
                            {healthCheckResult.brokenImages.map((img: any) => (
                              <li key={img.id} className="text-sm">
                                • {img.name} (ID: {img.id})
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Click "Run Check" to perform health check</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Storage Analysis</CardTitle>
                  <Button onClick={getStorageInfo} variant="outline" size="sm">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {storageStats && orphanedFiles ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Storage Statistics</h3>
                        <div className="space-y-2 text-sm">
                          <p>Total Files: {storageStats.totalFiles}</p>
                          <p>Total Size: {Math.round(storageStats.totalSize / 1024 / 1024 * 100) / 100} MB</p>
                          <p>Average File Size: {Math.round(storageStats.averageFileSize / 1024 * 100) / 100} KB</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">Orphaned Files</h3>
                        <div className="space-y-2 text-sm">
                          <p>Orphaned Files: {orphanedFiles.orphanedFiles.length}</p>
                          <p>Cleanup Size: {Math.round(orphanedFiles.cleanupSize / 1024 / 1024 * 100) / 100} MB</p>
                          <p>Referenced Files: {orphanedFiles.referencedFiles.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    {orphanedFiles.orphanedFiles.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium">Orphaned Files Found:</p>
                          <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {orphanedFiles.orphanedFiles.map((file: any, index: number) => (
                              <li key={index} className="text-sm">
                                • {file.name} ({Math.round(file.size / 1024)} KB)
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Click "Analyze" to check storage</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}