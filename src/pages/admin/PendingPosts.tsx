import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { convertToPublicUrl } from '@/lib/utils';
import { GallerySelector } from '@/components/GallerySelector';
import { GalleryService, type GalleryImage } from '@/lib/gallery';


interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_email: string;
  status: string;
  created_at: string;
  image?: string | null;
}

export default function PendingPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [localCoverImages, setLocalCoverImages] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching pending posts:', error);
      toast({
        title: "Erreur lors du chargement des articles",
        description: "Failed to load pending posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = async (postId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: `Post ${status}`,
        description: `The post has been ${status} successfully`
      });
    } catch (error) {
      console.error(`Error ${status} post:`, error);
      toast({
        title: "Erreur",
        description: `Échec de ${status === 'approved' ? "l'approbation" : 'la rejection'} de l'article`,
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'article",
        variant: "destructive"
      });
    }
  };

  const handleEditPost = (postId: string) => {
    navigate(`/edit/${postId}`);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    postId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const filePath = `${Date.now()}_${file.name}`;

    // Upload image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError || !uploadData) {
      console.error('Upload failed:', uploadError?.message);
      toast({
        title: "Upload failed",
        description: uploadError?.message || "No data returned from upload.",
        variant: "destructive"
      });
      return;
    }

    const rawImagePath = uploadData.path; // e.g. "1691332231_photo.jpg"

    // Save only the raw path in the post row
    const { error: updateError } = await supabase
      .from('posts')
      .update({ image: rawImagePath })
      .eq('id', postId);

    if (updateError) {
      console.error('Post update error:', updateError.message);
      toast({
        title: "Update failed",
        description: updateError.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Image Updated",
      description: "Image uploaded and path saved.",
    });

    fetchPendingPosts();
  };

  // Handle cover image selection from gallery - CLIENT-SIDE SOLUTION
  const handleCoverImageSelect = async (image: GalleryImage, postId: string) => {
    console.log('🎯 Selected cover image for post:', postId, image);
    console.log('🎯 Image URL:', image.url);
    console.log('🎯 Image file_path:', image.file_path);
    
    // IMMEDIATE CLIENT-SIDE UPDATE
    setLocalCoverImages(prev => ({
      ...prev,
      [postId]: image.file_path
    }));
    
    console.log('✅ IMMEDIATE CLIENT UPDATE: Cover image set for post', postId);
    toast({
      title: "Cover Image Updated",
      description: "Cover image has been updated successfully.",
    });
    
    // Try database update in background (but don't wait for it)
    try {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ image: image.file_path })
        .eq('id', postId);

      if (updateError) {
        console.error('❌ Database update failed (but UI updated):', updateError.message);
      } else {
        console.log('✅ Database update also successful');
      }
    } catch (error) {
      console.error('❌ Database update error (but UI updated):', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Posts</h1>
        <p className="text-muted-foreground">Review and approve blog posts</p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No pending posts to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription>
                      By {post.author_email} • {new Date(post.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* FORCE COVER IMAGE DISPLAY - NO CONTENT IMAGES */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">🎯 COVER IMAGE (FORCED):</h4>
                    {(post.image || localCoverImages[post.id]) ? (
                      <div className="border-2 border-blue-500 rounded-md p-2">
                        <img
                          src={convertToPublicUrl(localCoverImages[post.id] || post.image)}
                          alt={`COVER: ${post.title}`}
                          className="w-full h-48 object-cover rounded-md"
                          onLoad={() => console.log('✅ FORCED COVER IMAGE LOADED:', localCoverImages[post.id] || post.image)}
                          onError={(e) => console.error('❌ FORCED COVER IMAGE FAILED:', localCoverImages[post.id] || post.image, e)}
                        />
                        <p className="text-xs text-blue-600 mt-1 font-bold">
                          🎯 COVER IMAGE: {localCoverImages[post.id] || post.image}
                          {localCoverImages[post.id] && ' (LOCAL UPDATE)'}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-red-200 rounded-md flex items-center justify-center border-2 border-red-500">
                        <p className="text-red-600 font-bold">❌ NO COVER IMAGE</p>
                      </div>
                    )}
                    <p className="text-xs text-blue-500 mt-1">Debug: Post ID: {post.id}</p>
                  </div>
                  {/* CONTENT PREVIEW (WITHOUT IMAGES) */}
                  <div className="prose max-w-none">
                    <div className="bg-yellow-100 p-2 rounded-md mb-2">
                      <p className="text-xs text-yellow-800">
                        📝 Content preview (images disabled to show cover image only):
                      </p>
                    </div>
                    <div className="max-h-32 overflow-hidden">
                      <MarkdownRenderer content={post.content.replace(/!\[.*?\]\(.*?\)/g, '[IMAGE REMOVED]')} />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => updatePostStatus(post.id, 'approved')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updatePostStatus(post.id, 'rejected')}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleEditPost(post.id)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id={`upload-${post.id}`}
                        onChange={(e) => handleImageUpload(e, post.id)}
                        className="hidden"
                      />
                      <label htmlFor={`upload-${post.id}`}>
                        <Button size="sm" variant="outline">
                          Upload Image
                        </Button>
                      </label>
                      <GallerySelector
                        onImageSelect={(image) => handleCoverImageSelect(image, post.id)}
                        title="Sélectionner une image de couverture"
                        description="Choisissez une image pour la couverture de cet article"
                        trigger={
                          <Button size="sm" variant="outline">
                            Select from Gallery
                          </Button>
                        }
                      />
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => deletePost(post.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}





