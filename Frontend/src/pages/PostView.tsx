import { useCallback, useEffect, useState } from 'react';
import BlogPost from '../components/BlogPost';
import api from '@/config/api';
import { useParams } from 'react-router-dom';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_img: string;
  repo_link: string;
  user: Author;
  created_at: string;
  view_count: number;
  likes_count: number;
  comments_count: number;
  tags: { id: string; slug: string; name: string }[];
}

interface Author{
  id: string;
  full_name: string;
  user_name: string;
  avatar_url: string;
  bio?: string;
  total_followers: number;
}

interface CommentUser {
  id: string;
  user_name: string;
  avatar_url:string;
}

interface PostComment {
  id: string;
  content: string;
  author: CommentUser;
  created_at: string;
  replisCount:number;
  replies: PostComment[];
}

function PostView() {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [comment,setComment] = useState<PostComment[]>([]);
  const {id} = useParams();

  const fetchPost = useCallback(async () => {
    if (!id) return;
    const resposne = await api.get(`/api/posts/${id}`);
    setPost(resposne.data);
    setComment(resposne.data.comments);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fecthData = async() => {
      try {
        await fetchPost();
      } catch (error) {
        console.error("Error in Card Data:",error)
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
      }
    }
    fecthData();

    return () => clearInterval(progressInterval);
  }, [fetchPost, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AnimatedCircularProgressBar
            value={progress}
            gaugePrimaryColor="var(--color-land)"
            gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
            className="text-white"
          />
        </div>
      </div>
    );
  }

  return post ? (
    <BlogPost
      post={post}
      comments={comment}
      onCommentPosted={fetchPost}
    />
  ) : null;
}

export default PostView;
