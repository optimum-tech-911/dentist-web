import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const convertToPublicUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

  const { data } = supabase.storage
    .from('gallery')
    .getPublicUrl(imagePath);

  return data?.publicUrl || '';
};

// Usage:
<img src={convertToPublicUrl(post.image)} alt="gallery" />
interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_email: string;
  status: string;
  created_at: string;
  image?: string;
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

    // ✅ Convert image filename to public URL
    const processed = (data || []).map((post) => ({
      ...post,
      image: post.image ? convertToPublicUrl(post.image) : null,
    }));

    setPosts(processed);
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

      setPosts(posts.filter(p => p.id !== postId));
      toast({
        title: `Post ${status}`,
        description: `The post has been ${status} successfully`
      });
    } catch (error) {
      console.error(`Error ${status} post:`, error);
      toast({
        title: "Erreur",
        description: `Échec de ${status === 'approve' ? 'l\'approbation' : 'la rejection'} de l'article`,
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

      setPosts(posts.filter(p => p.id !== postId));
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
const handleImageUpload = async (file: File, postId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `articles/${fileName}`;

  const { data, error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Image upload error:', uploadError);
    toast({
      title: "Upload failed",
      description: "Could not upload image",
      variant: "destructive",
    });
    return;
  }

  // ✅ Get the public URL directly
  const { data: publicData } = supabase.storage
    .from('gallery')
    .getPublicUrl(filePath);

  // ✅ Save public URL directly in posts table
  const { error: updateError } = await supabase
    .from('posts')
    .update({ image: publicData?.publicUrl }) // << store actual full URL
    .eq('id', postId);

  if (updateError) {
    console.error('Error updating image URL:', updateError);
    toast({
      title: "Database update failed",
      description: "Could not save image URL",
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Image uploaded",
    description: "Your image was successfully uploaded and saved.",
  });
};

  const imagePath = data?.path;

  const { error: updateError } = await supabase
    .from('posts')
    .update({ image: imagePath }) // ✅ Update the post
    .eq('id', postId);

  if (updateError) {
    console.error('Post update error:', updateError.message);
    return;
  }

  toast({
    title: "Image updated",
    description: "Post image has been uploaded and saved.",
  });

  // Optional: refresh list after upload
  fetchPendingPosts?.();
};


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
            <div className="flex items-center gap-2 mt-2">
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




