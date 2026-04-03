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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-eggshell px-4 pb-8 pt-[calc(var(--app-navbar-height,0px)+1rem)] text-toffeebrown">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-lightbronze/28 blur-3xl" />
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-skyreflection/18 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rossycopper/12 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center gap-4 rounded-[1.75rem] border border-toffeebrown/12 bg-eggshell/78 px-8 py-7 shadow-[0_18px_55px_rgba(158,98,64,0.08)]">
          <AnimatedCircularProgressBar
            value={progress}
            gaugePrimaryColor="var(--color-rossycopper)"
            gaugeSecondaryColor="var(--color-lightbronze)"
            className="text-toffeebrown"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/58">
            Loading Story
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-eggshell px-4 pb-8 pt-[calc(var(--app-navbar-height,0px)+1rem)] text-toffeebrown">
        <div className="max-w-lg rounded-[1.9rem] border border-toffeebrown/12 bg-eggshell/85 px-8 py-10 text-center shadow-[0_18px_55px_rgba(158,98,64,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/48">
            Post View
          </p>
          <h1 className="mt-3 text-[clamp(2rem,6vw,3.2rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">
            Story Not Found
          </h1>
          <p className="mt-4 text-sm leading-7 text-toffeebrown/68">
            This post is unavailable right now or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BlogPost
      post={post}
      comments={comment}
      onCommentPosted={fetchPost}
    />
  );
}

export default PostView;
