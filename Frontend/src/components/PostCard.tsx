import { Eye, MessageCircle,Calendar,ThumbsUp} from 'lucide-react';

export interface Post {
  id: string;
  title: string;
  created_at: string;
  featured_img:string;
  likes_count:number;
  view_count: number;
  comments_count: number;
  exceprt: string;
}

interface PostCardProps {
  post: Post;
  onClick?: () => void | Promise<void>;
}

export default function PostCard({ post,onClick}: PostCardProps) {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div onClick={onClick} className="group relative bg-black border-2 border-blue/20 hover:border-blue transition-all duration-300 overflow-hidden">
      <div className="aspect-video overflow-hidden relative">
        <img
          src={post.featured_img}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-80" />
      </div>

      <div className="p-6 relative">
        <div className="flex items-center gap-2 mb-3 text-blue/70 text-sm font-mono">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(post.created_at)}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue transition-colors duration-300">
          {post.title}
        </h3>

        <p className="text-gray-400 mb-4 line-clamp-2">{post.exceprt}</p>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-blue">
            <Eye className="h-4 w-4" />
            <span className="font-mono">{post.view_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-blue">
            <ThumbsUp className="h-4 w-4" />
            <span className="font-mono">{post.likes_count}</span>
          </div>
          <div className="flex items-center gap-2 text-blue">
            <MessageCircle className="h-4 w-4" />
            <span className="font-mono">{post.comments_count}</span>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-20 h-20 bg-blue/5 -mr-10 -mt-10 rotate-45" />
      </div>
    </div>
  );
}
