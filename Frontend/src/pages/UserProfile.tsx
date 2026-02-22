import { useEffect, useState } from 'react';
import FollowButton from '@/components/FollowButton';
import { Users, Heart, FileText, Calendar } from 'lucide-react';
import userBg from "@/assets/userbg.png"
import { useParams } from 'react-router-dom';
import api from '@/config/api';
import PostCard from '@/components/PostCard';
import { type Post } from '@/components/PostCard';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';


interface PostListProps {
  posts: Post[];
}

function PostList({ posts }: PostListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}


interface User {
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
  const [userData,setuserData] =useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const {username} = useParams();

  useEffect(()=>{
    setLoading(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fecthdata = async() => {
      try {
        const res = await api.get(`/api/users/${username}`)
        // console.log(res.data);
        setuserData(res.data)
        setFollowerCount(res.data.total_followers ?? 0)
      } catch (error) {
        console.error("Errror in Profile Api:",error)
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
        setHasLoadedOnce(true);
      }
    }
    fecthdata();

    return () => clearInterval(progressInterval);
  },[username])

  if (!userData && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-300 font-mono">
        Failed to load profile.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {loading && !hasLoadedOnce && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-blue)"
              gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
              className="text-white"
            />
          </div>
        </div>
      )}

      {/* Hero Section with Diagonal Split */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:`url(${userBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="absolute inset-0 bg-linear-to-br from-blue/5 via-transparent to-transparent" />

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
                  <img src={userData?.avatar_url} alt={userData?.full_name} className="w-full h-full object-cover" />
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
                <h1 className="text-5xl font-black uppercase tracking-tight text-white">{userData?.full_name}</h1>
                <p className="text-2xl text-blue font-mono">@{userData?.user_name}</p>
              </div>

              {/* Bio */}
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-blue" />
                <p className="text-xl text-gray-300 pl-6 italic">{userData?.bio}</p>
              </div>

              {/* Follow Button */}
              <div className="pt-4">
                <FollowButton initialFollowerCount={userData?.total_followers ?? 0} onFollowerCountChange={setFollowerCount} />
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 text-gray-400 font-mono">
                <Calendar className="h-5 w-5 text-blue" />
                <span>Member since {userData?.created_at ? formatDate(userData.created_at) : "-"}</span>
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
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{userData?.total_following}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-mono relative z-10">Following</div>
                </div>
              </div>

              {/* Likes - Pentagon decoration */}
              <div className="stat-card">
                <div className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue/10 shape-pentagon translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                  <Heart className="h-10 w-10 text-blue mb-4 relative z-10" />
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{userData?.total_likes_received}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-mono relative z-10">Likes</div>
                </div>
              </div>

              {/* Posts - Octagon decoration */}
              <div className="stat-card">
                <div className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue/10 shape-octagon translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                  <FileText className="h-10 w-10 text-blue mb-4 relative z-10" />
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{userData?.total_posts}</div>
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
            <p className="text-gray-400 ml-16 font-mono">Explore {userData?.full_name}'s recent articles</p>
          </div>

          {/* Posts Grid */}
          <PostList posts={userData?.posts ?? []} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue/20 py-8 mt-20 relative">
        {/* Footer decorative shapes */}
        <div className="absolute top-0 left-20 w-16 h-16 bg-blue/8 shape-hexagon -translate-y-1/2" />
        <div className="absolute bottom-0 right-20 w-12 h-12 bg-blue/10 shape-pentagon" />
        
      </footer>

      {loading && hasLoadedOnce && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-blue)"
              gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
              className="text-white"
            />
            <p className="text-sm font-mono text-blue">{progress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
