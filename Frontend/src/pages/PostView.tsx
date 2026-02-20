import { useEffect, useState } from 'react';
import BlogPost from '../components/BlogPost';
import api from '@/config/api';
import { useParams } from 'react-router-dom';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_img: string;
  repo_link: string;
  user: User;
  created_at: string;
  view_count: number;
  likes_count: number;
  comments_count: number;
  tags: { id: string; slug: string; name: string }[];
}

interface User {
  id: string;
  user_name: string;
  avatar_url:string;
}

interface PostComment {
  id: string;
  content: string;
  author: User;
  created_at: string;
  repliesCount:number;
  replies: PostComment[];
}

function PostView() {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment,setComment] = useState<PostComment[]>([]);
  const {id} = useParams();

  useEffect(() => {
    const fecthData = async() => {
      try {
        const resposne = await api.get(`/api/posts/${id}`)
        setPost(resposne.data)
        setComment(resposne.data.comments)
      } catch (error) {
        console.error("Error in Card Data:",error)
      }
    }
    fecthData();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-land font-mono">Loading...</p>
      </div>
    );
  }

  return post ? <BlogPost post={post} comments={comment}/> : null;
}

export default PostView;
