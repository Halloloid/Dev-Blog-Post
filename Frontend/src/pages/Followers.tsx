import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/config/api";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

interface FollowerUser {
  user_name: string;
  avatar_url: string;
  full_name: string;
}

interface FollowersResponse {
  count: number;
  follower: FollowerUser[];
}

export default function Followers() {
  const [followerUsers, setFollowerUsers] = useState<FollowerUser[]>([]);
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

    const fetchFollowers = async () => {
      try {
        const res = await api.get<FollowersResponse>(`/api/follow/followers/${username}`);
        setFollowerUsers(res.data?.follower ?? []);
        setCount(res.data?.count ?? 0);
      } catch (err) {
        console.error("Error in Followers Api:", err);
        setError("Failed to load followers.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
      }
    };

    fetchFollowers();

    return () => clearInterval(progressInterval);
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-eggshell px-4 pb-8 pt-[calc(var(--app-navbar-height,0px)+1rem)] text-toffeebrown">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-rossycopper)"
              gaugeSecondaryColor="rgba(158, 98, 64, 0.12)"
              className="text-toffeebrown"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eggshell text-toffeebrown">
      <div className="mx-auto max-w-4xl px-4 pb-12 pt-[calc(var(--app-navbar-height,0px)+1.25rem)] sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/profile/${username}`)}
          className="inline-flex items-center gap-2 rounded-full border border-toffeebrown/14 bg-eggshell/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-toffeebrown/74 transition-colors hover:border-rossycopper/30 hover:text-toffeebrown"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </button>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">
              Followers
            </h1>
            <p className="mt-2 text-sm text-toffeebrown/62 sm:text-base">
              @{username} / {count} follower{count === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-[1.5rem] border border-rossycopper/22 bg-rossycopper/8 p-5 text-rossycopper">
            <p className="text-sm leading-7">{error}</p>
          </div>
        )}

        {!error && followerUsers.length === 0 && (
          <div className="mt-8 rounded-[1.5rem] border border-toffeebrown/12 bg-eggshell/92 p-6">
            <p className="text-sm leading-7 text-toffeebrown/64">No followers yet.</p>
          </div>
        )}

        {!error && followerUsers.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-6">
            {followerUsers.map((user, index) => {
              const layoutClassName =
                index % 4 === 0
                  ? "md:col-span-4"
                  : index % 4 === 1
                    ? "md:col-span-2"
                    : index % 4 === 2
                      ? "md:col-span-3"
                      : "md:col-span-3";

              const accentClassName =
                index % 3 === 0
                  ? "bg-lightbronze/10"
                  : index % 3 === 1
                    ? "bg-skyreflection/10"
                    : "bg-eggshell/94";

              return (
                <button
                  key={user.user_name}
                  onClick={() => navigate(`/profile/${user.user_name}`)}
                  className={`flex w-full items-center gap-4 rounded-[1.45rem] border border-toffeebrown/12 px-4 py-4 text-left transition-transform duration-200 hover:-translate-y-0.5 hover:bg-lightbronze/12 sm:px-5 ${layoutClassName} ${accentClassName}`}
                >
                  <img
                    src={user.avatar_url}
                    alt={user.user_name}
                    className="h-12 w-12 rounded-full border border-toffeebrown/12 object-cover sm:h-14 sm:w-14"
                    referrerPolicy="no-referrer"
                  />
                  <span className="truncate text-base font-semibold text-toffeebrown sm:text-lg">
                    @{user.user_name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

