import { type ReactNode, useEffect, useState } from "react";
import FollowButton from "@/components/FollowButton";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";
import userBg from "@/assets/userbg.png";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/config/api";
import PostCard, { type Post } from "@/components/PostCard";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const createDeleteChallenge = () =>
  Array.from({ length: 6 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");

interface PostListProps {
  posts: Post[];
  canEdit: boolean;
  profileUsername?: string;
  onDeletePost: (post: Post) => void;
}

type PostFilter = "published" | "draft";

interface DeletePostModalProps {
  post: Post;
  challenge: string;
  answer: string;
  error: string;
  isDeleting: boolean;
  canDelete: boolean;
  onAnswerChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function DeletePostModal({
  post,
  challenge,
  answer,
  error,
  isDeleting,
  canDelete,
  onAnswerChange,
  onClose,
  onConfirm,
}: DeletePostModalProps) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-toffeebrown/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-rossycopper/20 bg-eggshell p-5 text-toffeebrown shadow-[0_30px_90px_rgba(158,98,64,0.22)] sm:p-6">
        <div className="mb-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-rossycopper/72">
            Permanent Action
          </p>
          <div className="mt-3 flex items-start gap-3">
            <div className="mt-1 rounded-full border border-rossycopper/18 bg-rossycopper/10 p-2 text-rossycopper">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="text-[clamp(1.65rem,5vw,2.2rem)] font-black uppercase leading-[0.96] tracking-[-0.05em] text-toffeebrown">
                Delete This Post?
              </h2>
              <p className="mt-2 text-sm leading-7 text-toffeebrown/72">
                <span className="font-semibold text-rossycopper">"{post.title || "Untitled Post"}"</span> will be
                removed permanently. This cannot be restored after you confirm it.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.4rem] border border-rossycopper/18 bg-rossycopper/8 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-toffeebrown/58">
              Type this CAPTCHA to continue
            </p>
            <p className="mt-3 break-all text-[1.55rem] font-black uppercase tracking-[0.3em] text-rossycopper sm:text-[1.8rem]">
              {challenge}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown/62">
              CAPTCHA
            </label>
            <input
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value.toUpperCase())}
              placeholder="Enter the code exactly"
              autoComplete="off"
              disabled={isDeleting}
              className="w-full rounded-[1.2rem] border border-toffeebrown/14 bg-eggshell px-4 py-3 text-sm text-toffeebrown outline-none transition-colors placeholder:text-toffeebrown/35 focus:border-rossycopper"
            />
            <p className="mt-2 text-xs leading-6 text-toffeebrown/52">
              This extra step helps prevent accidental deletion.
            </p>
            {error && <p className="mt-2 text-sm text-rossycopper">{error}</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canDelete || isDeleting}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-rossycopper px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-eggshell transition-colors hover:bg-toffeebrown disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-full border border-toffeebrown/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-toffeebrown/75 transition-colors hover:border-toffeebrown hover:text-toffeebrown disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostList({ posts, canEdit, profileUsername, onDeletePost }: PostListProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => {
            if (post.status === 'draft' && canEdit && profileUsername) {
              navigate(`/createpost/${profileUsername}?draft=${post.id}`);
              return;
            }

            navigate(`/post/${post.id}`);
          }}
          showEditButton={canEdit}
          onEdit={
            canEdit && profileUsername
              ? () => navigate(
                  post.status === 'draft'
                    ? `/createpost/${profileUsername}?draft=${post.id}`
                    : `/profile/${profileUsername}/posts/${post.id}/edit`
                )
              : undefined
          }
          showDeleteButton={canEdit}
          onDelete={canEdit ? () => onDeletePost(post) : undefined}
        />
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

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();
}

function ProfileStatCard({
  label,
  value,
  icon,
  description,
  className,
  onClick,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  description: string;
  className: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex rounded-full border border-current/12 bg-eggshell/78 p-2.5 shadow-[0_10px_24px_rgba(158,98,64,0.08)]">
          {icon}
        </div>
        {onClick && (
          <ArrowUpRight className="size-4 text-toffeebrown/62 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </div>
      <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/68">{label}</p>
      <p className="mt-2 text-[clamp(1.9rem,6vw,3rem)] font-black uppercase leading-[0.92] tracking-[-0.06em] text-toffeebrown">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-toffeebrown/82">{description}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative w-full overflow-hidden rounded-[1.6rem] border p-4 text-left shadow-[0_18px_45px_rgba(84,38,20,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:p-5",
          className
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-eggshell/40 to-transparent" />
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[1.6rem] border p-4 shadow-[0_18px_45px_rgba(84,38,20,0.12)] backdrop-blur-md sm:p-5",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-eggshell/40 to-transparent" />
      {content}
    </div>
  );
}

export default function UserProfile() {
  const [followerCount, setFollowerCount] = useState(0);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; user_name: string } | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteChallenge, setDeleteChallenge] = useState("");
  const [deleteAnswer, setDeleteAnswer] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [activePostFilter, setActivePostFilter] = useState<PostFilter>("published");
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    setActivePostFilter("published");
  }, [username]);

  useEffect(() => {
    setLoading(true);
    setProgress(10);
    setIsFollowing(false);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fetchData = async () => {
      try {
        const [res, meRes] = await Promise.all([
          api.get(`/api/users/${username}`),
          api.get("/auth/me", { withCredentials: true }).catch(() => null),
        ]);
        setUserData(res.data);
        setFollowerCount(res.data.total_followers ?? 0);
        setCurrentUser(meRes?.data ?? null);

        if (meRes?.data?.id) {
          try {
            const followingRes = await api.get("/api/follow/following");
            const isUserFollowing = followingRes.data?.following?.some(
              (user: { id?: string }) => user.id === res.data.id
            );
            setIsFollowing(Boolean(isUserFollowing));
          } catch (followError) {
            console.error("Error in Following Api:", followError);
          }
        }
      } catch (error) {
        console.error("Error in Profile Api:", error);
        setUserData(null);
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
        setHasLoadedOnce(true);
      }
    };

    void fetchData();

    return () => clearInterval(progressInterval);
  }, [username]);

  if (!userData && !loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-eggshell px-4 pb-8 pt-[calc(var(--app-navbar-height,0px)+1rem)] text-toffeebrown">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-lightbronze/28 blur-3xl" />
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-skyreflection/18 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rossycopper/12 blur-3xl" />
        </div>
        <div className="relative max-w-lg rounded-[1.9rem] border border-toffeebrown/12 bg-eggshell/88 px-8 py-10 text-center shadow-[0_18px_55px_rgba(158,98,64,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/48">
            Creator Profile
          </p>
          <h1 className="mt-3 text-[clamp(2rem,6vw,3.2rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">
            Profile Not Found
          </h1>
          <p className="mt-4 text-sm leading-7 text-toffeebrown/68">
            This creator profile is unavailable right now or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleFollowingClick = () => {
    if (!username) return;
    navigate(`/profile/${username}/following`);
  };

  const handleFollowersClick = () => {
    if (!username) return;
    navigate(`/profile/${username}/followers`);
  };

  const isOwnProfile =
    Boolean(currentUser?.id && userData?.id && currentUser.id === userData.id) ||
    Boolean(currentUser?.user_name && username && currentUser.user_name === username);

  const handleFollowClick = async () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow creators.",
        variant: "error",
      });
      return;
    }

    if (!userData?.id) return;

    const prevIsFollowing = isFollowing;
    const prevFollowerCount = followerCount;
    const optimisticIsFollowing = !prevIsFollowing;
    setIsFollowing(optimisticIsFollowing);
    setFollowerCount((count) => Math.max(0, count + (optimisticIsFollowing ? 1 : -1)));

    try {
      const res = await api.post(`/api/follow/${userData.id}`);
      if (typeof res.data?.followed === "boolean") {
        setIsFollowing(res.data.followed);
      }
    } catch (error) {
      setIsFollowing(prevIsFollowing);
      setFollowerCount(prevFollowerCount);
      toast({
        title: "Follow failed",
        description: "Please try again.",
        variant: "error",
      });
      console.error("Error in Follow Api:", error);
    }
  };

  const openDeleteModal = (post: Post) => {
    setPostToDelete(post);
    setDeleteChallenge(createDeleteChallenge());
    setDeleteAnswer("");
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (isDeletingPost) return;
    setPostToDelete(null);
    setDeleteChallenge("");
    setDeleteAnswer("");
    setDeleteError("");
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    if (deleteAnswer.trim().toUpperCase() !== deleteChallenge) {
      setDeleteError("Please type the CAPTCHA exactly before deleting.");
      return;
    }

    setIsDeletingPost(true);
    setDeleteError("");

    try {
      await api.delete(`/api/posts/${postToDelete.id}`, {
        withCredentials: true,
      });

      const deletedPostId = postToDelete.id;
      const deletedPostTitle = postToDelete.title?.trim() || "Untitled Post";

      setUserData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          total_posts: Math.max(0, prev.total_posts - 1),
          posts: prev.posts.filter((post) => post.id !== deletedPostId),
        };
      });

      setPostToDelete(null);
      setDeleteChallenge("");
      setDeleteAnswer("");
      setDeleteError("");

      toast({
        title: "Post deleted",
        description: `"${deletedPostTitle}" was permanently removed.`,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete post.";
      setDeleteError(message);
      toast({
        title: "Delete failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsDeletingPost(false);
    }
  };

  const canConfirmDelete =
    Boolean(postToDelete) && deleteAnswer.trim().toUpperCase() === deleteChallenge;

  const profile = userData;
  const publishedPosts = (profile?.posts ?? []).filter((post) => post.status === "published");
  const draftPosts = (profile?.posts ?? []).filter((post) => post.status === "draft");
  const visiblePosts = isOwnProfile
    ? activePostFilter === "draft"
      ? draftPosts
      : publishedPosts
    : publishedPosts;
  const visibleSectionTitle = isOwnProfile
    ? activePostFilter === "draft"
      ? "Draft Shelf"
      : "Published Archive"
    : "Recent Stories";
  const visibleSectionDescription = isOwnProfile
    ? activePostFilter === "draft"
      ? "Private working drafts you can reopen, revise, and shape before publishing."
      : "The stories and posts currently live on your public profile."
    : `A reading shelf of ${profile?.full_name}'s published posts and finished pieces.`;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-eggshell text-toffeebrown">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-lightbronze/24 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-skyreflection/18 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-rossycopper/10 blur-3xl" />
      </div>

      {loading && !hasLoadedOnce && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-eggshell/92 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-[1.9rem] border border-toffeebrown/12 bg-eggshell px-8 py-7 shadow-[0_18px_55px_rgba(158,98,64,0.08)]">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-rossycopper)"
              gaugeSecondaryColor="var(--color-lightbronze)"
              className="text-toffeebrown"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/58">
              Loading Creator Profile
            </p>
          </div>
        </div>
      )}

      {profile && (
        <section className="relative overflow-hidden border-b border-toffeebrown/10 bg-rossycopper text-eggshell">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url(${userBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-skyreflection)_0%,transparent_34%)] opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-lightbronze)_0%,transparent_36%)] opacity-18" />

          <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-[calc(var(--app-navbar-height,0px)+1rem)] sm:px-6 lg:px-8 lg:pb-14 lg:pt-[calc(var(--app-navbar-height,0px)+1.5rem)]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-eggshell/18 bg-eggshell/10 px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-eggshell/84">
                <Sparkles className="size-3.5" />
                Creator Profile
              </span>
              <span className="rounded-full border border-eggshell/18 bg-eggshell/10 px-3 py-2 text-[0.72rem] font-semibold tracking-[0.18em] text-eggshell/78">
                @{profile.user_name}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] xl:items-stretch">
              <div className="min-w-0 rounded-[2rem] border border-eggshell/18 bg-eggshell/10 p-4 backdrop-blur-sm sm:p-5 lg:p-7">
                <div className="flex items-start gap-4 sm:gap-5 lg:gap-6">
                  <div className="relative w-fit shrink-0">
                    <div className="absolute -inset-2 rotate-[-4deg] rounded-[1.6rem] border border-eggshell/12 bg-eggshell/8 sm:-inset-2.5 sm:rounded-[1.8rem] lg:-inset-3 lg:rounded-[2rem]" />
                    <div className="relative size-24 overflow-hidden rounded-[1.35rem] border border-eggshell/18 bg-eggshell/12 p-1.5 shadow-[0_16px_34px_rgba(0,0,0,0.12)] sm:size-28 sm:rounded-[1.55rem] sm:p-2 lg:size-48 lg:rounded-[1.8rem]">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="size-full rounded-[1rem] object-cover sm:rounded-[1.2rem] lg:rounded-[1.4rem]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center rounded-[1rem] bg-eggshell/18 text-3xl font-black uppercase tracking-[-0.06em] text-eggshell sm:rounded-[1.2rem] sm:text-4xl lg:rounded-[1.4rem] lg:text-5xl">
                          {getInitials(profile.full_name || profile.user_name)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 rounded-full border border-eggshell/18 bg-eggshell/14 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-eggshell backdrop-blur-sm sm:-bottom-3 sm:-right-3 sm:px-4 sm:py-2 sm:text-[0.68rem] sm:tracking-[0.18em]">
                      {isOwnProfile ? "Your Desk" : "Profile Live"}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-4 sm:space-y-5">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center rounded-full border border-eggshell/18 bg-eggshell/10 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-eggshell/80">
                        Editorial profile
                      </span>
                      <span className="inline-flex items-center rounded-full border border-skyreflection/35 bg-skyreflection/14 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-eggshell">
                        Member since {formatDate(profile.created_at)}
                      </span>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <h1 className="max-w-3xl text-[clamp(2rem,9.5vw,4.9rem)] font-black leading-[0.92] tracking-[-0.05em] text-balance sm:leading-[0.9] lg:tracking-[-0.06em]">
                        {profile.full_name}
                      </h1>
                      <p className="text-sm font-semibold tracking-[0.08em] text-eggshell/72 sm:text-base lg:text-lg">
                        @{profile.user_name}
                      </p>
                    </div>

                    <p className="max-w-2xl text-sm leading-6 text-eggshell/84 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
                      {profile.bio?.trim()
                        ? profile.bio
                        : isOwnProfile
                          ? "Add a short bio to turn this profile into a better front page for your work."
                          : "This creator prefers letting the work speak first, but the archive is open below."}
                    </p>

                    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                      {!isOwnProfile ? (
                        <FollowButton isFollowing={isFollowing} onClick={handleFollowClick} />
                      ) : (
                        <div className="inline-flex w-full items-center justify-center rounded-full border border-eggshell/18 bg-eggshell/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-eggshell sm:w-auto">
                          This is your profile
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleFollowersClick}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-eggshell/18 bg-eggshell/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-eggshell transition-colors hover:bg-eggshell/16 sm:w-auto"
                      >
                        <Users className="size-4" />
                        {followerCount.toLocaleString()} followers
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:hidden">
                      <button
                        type="button"
                        onClick={handleFollowingClick}
                        className="rounded-[1.1rem] border border-eggshell/18 bg-eggshell/12 px-3 py-3 text-left backdrop-blur-sm transition-colors hover:bg-eggshell/18"
                      >
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-eggshell/65">
                          Following
                        </p>
                        <p className="mt-2 text-2xl font-black leading-none tracking-[-0.05em] text-eggshell">
                          {profile.total_following.toLocaleString()}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={handleFollowersClick}
                        className="rounded-[1.1rem] border border-eggshell/18 bg-eggshell/12 px-3 py-3 text-left backdrop-blur-sm transition-colors hover:bg-eggshell/18"
                      >
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-eggshell/65">
                          Followers
                        </p>
                        <p className="mt-2 text-2xl font-black leading-none tracking-[-0.05em] text-eggshell">
                          {followerCount.toLocaleString()}
                        </p>
                      </button>
                      <div className="rounded-[1.1rem] border border-eggshell/18 bg-eggshell/12 px-3 py-3 backdrop-blur-sm">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-eggshell/65">
                          Likes
                        </p>
                        <p className="mt-2 text-2xl font-black leading-none tracking-[-0.05em] text-eggshell">
                          {profile.total_likes_received.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-[1.1rem] border border-eggshell/18 bg-eggshell/12 px-3 py-3 backdrop-blur-sm">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-eggshell/65">
                          Posts
                        </p>
                        <p className="mt-2 text-2xl font-black leading-none tracking-[-0.05em] text-eggshell">
                          {profile.total_posts.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden min-w-0 flex-col gap-4 xl:flex">
                <div className="rounded-[2rem] border border-eggshell/18 bg-eggshell/10 p-5 backdrop-blur-sm sm:p-6">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-eggshell/62">
                    Profile Note
                  </p>
                  <p className="mt-3 text-lg leading-8 text-eggshell/86">
                    {isOwnProfile
                      ? "Your profile is the front cover of your work. Keep the public archive sharp, and let drafts stay comfortably behind the curtain."
                      : `${profile.full_name} keeps a readable archive here, with profile stats, published work, and a creator presence that feels more like a journal cover than a dashboard.`}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-eggshell/18 bg-eggshell/10 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-eggshell/78">
                      {publishedPosts.length} published
                    </span>
                    {isOwnProfile && (
                      <span className="inline-flex rounded-full border border-skyreflection/30 bg-skyreflection/14 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-eggshell">
                        {draftPosts.length} drafts
                      </span>
                    )}
                    <span className="inline-flex rounded-full border border-lightbronze/35 bg-lightbronze/16 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-eggshell">
                      {profile.total_likes_received.toLocaleString()} likes earned
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileStatCard
                    label="Followers"
                    value={followerCount.toLocaleString()}
                    icon={<Users className="size-5 text-toffeebrown" />}
                    description="See who is following this creator."
                    className="border-eggshell/26 bg-eggshell/96 text-toffeebrown hover:border-eggshell/36 hover:bg-eggshell"
                    onClick={handleFollowersClick}
                  />
                  <ProfileStatCard
                    label="Following"
                    value={profile.total_following.toLocaleString()}
                    icon={<Users className="size-5 text-toffeebrown" />}
                    description="Profiles and people this creator follows."
                    className="border-skyreflection/28 bg-eggshell/92 text-toffeebrown hover:border-skyreflection/40 hover:bg-eggshell/96"
                    onClick={handleFollowingClick}
                  />
                  <ProfileStatCard
                    label="Likes"
                    value={profile.total_likes_received.toLocaleString()}
                    icon={<Heart className="size-5 text-toffeebrown" />}
                    description="Total appreciation collected across posts."
                    className="border-lightbronze/30 bg-eggshell/92 text-toffeebrown"
                  />
                  <ProfileStatCard
                    label="Posts"
                    value={profile.total_posts.toLocaleString()}
                    icon={<FileText className="size-5 text-toffeebrown" />}
                    description="Stories, notes, and archived writing pieces."
                    className="border-toffeebrown/22 bg-eggshell/92 text-toffeebrown"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {profile && (
        <section className="relative py-10 sm:py-14 lg:py-16">
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-toffeebrown/12 bg-eggshell/82 p-5 shadow-[0_24px_80px_rgba(158,98,64,0.08)] backdrop-blur-sm sm:p-6 lg:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-toffeebrown/48">
                    Writing Archive
                  </p>
                  <h2 className="mt-3 text-[clamp(2rem,6vw,4.4rem)] font-black uppercase leading-[0.92] tracking-[-0.06em] text-toffeebrown">
                    {visibleSectionTitle}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-toffeebrown/68 sm:text-base">
                    {visibleSectionDescription}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-start lg:items-end">
                  <div className="inline-flex items-center gap-2 rounded-full border border-toffeebrown/12 bg-lightbronze/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown/72">
                    <CalendarDays className="size-4" />
                    Member since {formatDate(profile.created_at)}
                  </div>

                  {isOwnProfile && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePostFilter("published")}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors sm:px-5 sm:text-sm",
                          activePostFilter === "published"
                            ? "border-rossycopper bg-rossycopper text-eggshell"
                            : "border-toffeebrown/14 bg-eggshell text-toffeebrown/68 hover:border-rossycopper/28 hover:text-toffeebrown"
                        )}
                      >
                        Published ({publishedPosts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePostFilter("draft")}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors sm:px-5 sm:text-sm",
                          activePostFilter === "draft"
                            ? "border-skyreflection bg-skyreflection text-toffeebrown"
                            : "border-toffeebrown/14 bg-eggshell text-toffeebrown/68 hover:border-skyreflection/35 hover:text-toffeebrown"
                        )}
                      >
                        Drafts ({draftPosts.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                {visiblePosts.length > 0 ? (
                  <PostList
                    posts={visiblePosts}
                    canEdit={isOwnProfile}
                    profileUsername={profile.user_name}
                    onDeletePost={openDeleteModal}
                  />
                ) : (
                  <div className="rounded-[1.7rem] border border-toffeebrown/12 bg-lightbronze/10 px-5 py-10 text-center sm:px-6 sm:py-12">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">
                      {isOwnProfile && activePostFilter === "draft" ? "No Drafts Yet" : "No Posts Yet"}
                    </p>
                    <h3 className="mt-3 text-[clamp(1.55rem,5vw,2.4rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">
                      The Shelf Is Quiet For Now
                    </h3>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-toffeebrown/68 sm:text-base">
                      {isOwnProfile && activePostFilter === "draft"
                        ? "Your draft posts will appear here as you save them, ready to reopen and keep refining."
                        : isOwnProfile
                          ? "Your published posts will show up here once you put them live."
                          : "There are no public posts to show in this section right now."}
                    </p>
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => navigate(`/createpost/${profile.user_name}`)}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-rossycopper px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-eggshell transition-colors hover:bg-toffeebrown"
                      >
                        Start A New Post
                        <ArrowUpRight className="size-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {loading && hasLoadedOnce && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-eggshell/55 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-toffeebrown/12 bg-eggshell px-7 py-6 shadow-[0_18px_55px_rgba(158,98,64,0.08)]">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-rossycopper)"
              gaugeSecondaryColor="var(--color-lightbronze)"
              className="text-toffeebrown"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/58">
              Refreshing profile
            </p>
          </div>
        </div>
      )}

      {postToDelete && (
        <DeletePostModal
          post={postToDelete}
          challenge={deleteChallenge}
          answer={deleteAnswer}
          error={deleteError}
          isDeleting={isDeletingPost}
          canDelete={canConfirmDelete}
          onAnswerChange={(value) => {
            setDeleteAnswer(value);
            if (deleteError) {
              setDeleteError("");
            }
          }}
          onClose={closeDeleteModal}
          onConfirm={handleDeletePost}
        />
      )}
    </div>
  );
}
