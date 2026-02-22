import { useState } from 'react';
import { Users, Heart, FileText, Calendar } from 'lucide-react';

import { Eye, MessageCircle} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';

export function useFollowToggle(initialFollowerCount: number) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  const toggleFollow = () => {
    setIsFollowing((prev) => {
      const newState = !prev;
      setFollowerCount((count) => (newState ? count + 1 : count - 1));
      return newState;
    });
  };

  return {
    isFollowing,
    followerCount,
    toggleFollow,
  };
}


interface FollowButtonProps {
  initialFollowerCount: number;
  onFollowerCountChange?: (count: number) => void;
}

function FollowButton({ initialFollowerCount, onFollowerCountChange }: FollowButtonProps) {
  const { isFollowing, followerCount, toggleFollow } = useFollowToggle(initialFollowerCount);

  const handleToggle = () => {
    toggleFollow();
    if (onFollowerCountChange) {
      onFollowerCountChange(isFollowing ? followerCount - 1 : followerCount + 1);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      className={`
        relative overflow-hidden font-bold uppercase tracking-wider transition-all duration-300
        ${
          isFollowing
            ? 'bg-transparent border-2 border-blue text-blue hover:bg-blue/10'
            : 'bg-blue text-black border-2 border-blue hover:bg-blue/90'
        }
      `}
      size="lg"
    >
      {isFollowing ? (
        <>
          <UserCheck className="mr-2 h-5 w-5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-5 w-5" />
          Follow
        </>
      )}
    </Button>
  );
}


interface PostCardProps {
  post: Post;
  index: number;
}

function PostCard({ post, index }: PostCardProps) {
  const postImages = [
    '/assets/generated/post-1.dim_800x450.png',
    '/assets/generated/post-2.dim_800x450.png',
    '/assets/generated/post-3.dim_800x450.png',
  ];

  const imageUrl = postImages[index % postImages.length];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="group relative bg-black border-2 border-blue/20 hover:border-blue transition-all duration-300 overflow-hidden">
      <div className="aspect-video overflow-hidden relative">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
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
            <MessageCircle className="h-4 w-4" />
            <span className="font-mono">{post.comments_count}</span>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-20 h-20 bg-blue/5 -mr-10 -mt-10 rotate-45" />
      </div>
    </div>
  );
}


interface PostListProps {
  posts: Post[];
}

function PostList({ posts }: PostListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}


export interface Post {
  id: string;
  title: string;
  created_at: string;
  view_count: number;
  comments_count: number;
  exceprt: string;
}

export interface User {
  id: string;
  full_name: string;
  user_name: string;
  avatar_url: string;
  bio: string;
  total_followers: number;
  total_following: number;
  total_likes_received: number;
  total_posts: number;
  created_at: string;
  posts: Post[];
}


export default function UserProfile() {
  const [followerCount, setFollowerCount] = useState(3);

  const userData: User = {
    id: '47a16fea-cd4a-4a19-920c-49b334684f94',
    full_name: 'John Developer',
    user_name: 'john_dev',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john_dev',
    bio: 'Full Stack Developer | TypeScript Enthusiast',
    total_followers: 3,
    total_following: 1,
    total_likes_received: 5,
    total_posts: 3,
    created_at: '2026-01-31T11:29:59.085Z',
    posts: [
      {
        id: '9617d0f9-e897-4428-9774-c54728552728',
        title: 'TypeScript Generics Explained',
        created_at: '2026-01-31T11:30:00.973Z',
        view_count: 74,
        comments_count: 0,
        exceprt: 'Learn how to use TypeScript Generics to write flexible and reusable code',
      },
      {
        id: '7b507f9b-fcf8-4025-a5d8-2ee0882796d0',
        title: 'Advanced React Patterns for State Management',
        created_at: '2026-01-31T11:30:00.971Z',
        view_count: 339,
        comments_count: 12,
        exceprt: 'Explore advanced patterns and best practices for managing state in React applications',
      },
      {
        id: '7a70d9ff-a9c2-44de-8c3f-17decf232486',
        title: 'Getting Started with TypeScript in 2024',
        created_at: '2026-01-31T11:30:00.971Z',
        view_count: 305,
        comments_count: 15,
        exceprt: 'Learn the basics of TypeScript and why you should use it in your next project',
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Diagonal Split */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(/assets/userbg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-blue/5 via-transparent to-transparent" />

        {/* Diagonal blue Line */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue/5 transform skew-x-12 translate-x-1/4" />

        {/* Decorative Geometric Shapes - Hero Section */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue/10 shape-hexagon" />
        <div className="absolute top-32 right-20 w-32 h-32 bg-blue/15 shape-circle" />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue/8 shape-pentagon" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-blue/12 shape-octagon" />

        <div className="relative container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start ms-15">
            {/* Left Column - Profile Info */}
            <div className="space-y-8">
              {/* Avatar with blue Border */}
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-blue/20 blur-xl" />
                <div className="relative w-48 h-48 border-4 border-blue p-2 bg-black">
                  <img src={userData.avatar_url} alt={userData.full_name} className="w-full h-full object-cover" />
                </div>
                {/* Circle decoration instead of rotated square */}
                <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-blue/80 shape-circle" />
                {/* Additional triangle decoration */}
                <div className="absolute -top-2 -left-2">
                  <div className="shape-triangle-sm opacity-60" style={{ borderBottomColor: 'oklch(0.9 0.3 195 / 60%)' }} />
                </div>
              </div>

              {/* Name and Username */}
              <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase tracking-tight text-white">{userData.full_name}</h1>
                <p className="text-2xl text-blue font-mono">@{userData.user_name}</p>
              </div>

              {/* Bio */}
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-blue" />
                <p className="text-xl text-gray-300 pl-6 italic">{userData.bio}</p>
              </div>

              {/* Follow Button */}
              <div className="pt-4">
                <FollowButton initialFollowerCount={userData.total_followers} onFollowerCountChange={setFollowerCount} />
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 text-gray-400 font-mono">
                <Calendar className="h-5 w-5 text-blue" />
                <span>Member since {formatDate(userData.created_at)}</span>
              </div>
            </div>

            {/* Right Column - Stats Grid */}
            <div className="grid grid-cols-2 gap-6 lg:pt-12">
              {/* Followers - Hexagon decoration */}
              <div className="stat-card">
                <div className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue/10 shape-hexagon translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                  <Users className="h-10 w-10 text-blue mb-4 relative z-10" />
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{followerCount}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-mono relative z-10">Followers</div>
                </div>
              </div>

              {/* Following - Circle decoration */}
              <div className="stat-card">
                <div className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-blue/10 shape-circle translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-500" />
                  <Users className="h-10 w-10 text-blue mb-4 relative z-10" />
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{userData.total_following}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-mono relative z-10">Following</div>
                </div>
              </div>

              {/* Likes - Pentagon decoration */}
              <div className="stat-card">
                <div className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue/10 shape-pentagon translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                  <Heart className="h-10 w-10 text-blue mb-4 relative z-10" />
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{userData.total_likes_received}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-mono relative z-10">Likes</div>
                </div>
              </div>

              {/* Posts - Octagon decoration */}
              <div className="stat-card">
                <div className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue/10 shape-octagon translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                  <FileText className="h-10 w-10 text-blue mb-4 relative z-10" />
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{userData.total_posts}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-mono relative z-10">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="relative py-20">
        {/* Decorative Geometric Shapes - Posts Section */}
        <div className="absolute top-10 right-10 w-28 h-28 bg-blue/8 shape-star" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue/10 shape-diamond" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue/12 shape-circle" />
        <div className="absolute bottom-10 right-1/3">
          <div className="shape-triangle opacity-40" style={{ borderBottomColor: 'oklch(0.9 0.3 195 / 40%)' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="mb-12 relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-1 bg-blue" />
              <h2 className="text-4xl font-black uppercase tracking-tight">Latest Posts</h2>
            </div>
            <p className="text-gray-400 ml-16 font-mono">Explore {userData.full_name}'s recent articles</p>
          </div>

          {/* Posts Grid */}
          <PostList posts={userData.posts} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue/20 py-8 mt-20 relative">
        {/* Footer decorative shapes */}
        <div className="absolute top-0 left-20 w-16 h-16 bg-blue/8 shape-hexagon -translate-y-1/2" />
        <div className="absolute bottom-0 right-20 w-12 h-12 bg-blue/10 shape-pentagon" />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="text-gray-400 font-mono">
            Built with <span className="text-blue">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-gray-600 text-sm mt-2">© {new Date().getFullYear()} Profile Showcase</p>
        </div>
      </footer>
    </div>
  );
}
