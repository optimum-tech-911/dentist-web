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
                  {post.image && (
                    <img
                      src={convertToPublicUrl(post.image)}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  <div className="prose max-w-none">
                    <MarkdownRenderer content={post.content} />
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





