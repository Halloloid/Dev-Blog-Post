import { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/config/api";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

interface FollowingUser {
  user_name: string;
  avatar_url: string;
  full_name: string;
}

interface FollowingsResponse {
  count: number;
  following: FollowingUser[];
}

export default function Followings() {
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!username) {
      setError("Username not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setProgress(10);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fetchFollowings = async () => {
      try {
        const res = await api.get<FollowingsResponse>(`/api/follow/followings/${username}`);
        setFollowingUsers(res.data?.following ?? []);
        setCount(res.data?.count ?? 0);
      } catch (err) {
        console.error("Error in Followings Api:", err);
        setError("Failed to load following users.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
      }
    };

    fetchFollowings();

    return () => clearInterval(progressInterval);
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AnimatedCircularProgressBar
            value={progress}
            gaugePrimaryColor="var(--color-blue)"
            gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
            className="text-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-12">
        <button
          onClick={() => navigate(`/profile/${username}`)}
          className="inline-flex items-center gap-2 mb-8 border border-blue/30 px-4 py-2 rounded-md text-blue hover:bg-blue/10 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-blue" />
          <h1 className="text-4xl font-black uppercase tracking-tight">Following</h1>
        </div>
        <p className="text-gray-400 font-mono mb-8">@{username} is following {count} user(s)</p>

        {error && <p className="text-red-400 font-mono">{error}</p>}

        {!error && followingUsers.length === 0 && (
          <p className="text-gray-400 font-mono">No following users found.</p>
        )}

        {!error && followingUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {followingUsers.map((user) => (
              <button
                key={user.user_name}
                onClick={() => navigate(`/profile/${user.user_name}`)}
                className="w-full text-left border border-blue/20 rounded-lg p-4 bg-black/60 hover:border-blue transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-blue/30"
                  />
                  <div>
                    <p className="text-white font-bold">{user.full_name}</p>
                    <p className="text-gray-400 font-mono text-sm">@{user.user_name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
