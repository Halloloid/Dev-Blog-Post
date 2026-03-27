import { useEffect, useState } from 'react';
import FollowButton from '@/components/FollowButton';
import { Users, Heart, FileText, Calendar, AlertTriangle } from 'lucide-react';
import userBg from "@/assets/userbg.png"
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/config/api';
import PostCard from '@/components/PostCard';
import { type Post } from '@/components/PostCard';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { useToast } from '@/components/ui/toast';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const createDeleteChallenge = () =>
  Array.from({ length: 6 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

interface PostListProps {
  posts: Post[];
  canEdit: boolean;
  profileUsername?: string;
  onDeletePost: (post: Post) => void;
}

type PostFilter = 'published' | 'draft';

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#09040d] p-6 shadow-[0_0_40px_rgba(239,68,68,0.18)]">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.35em] text-red-300/70">
            Permanent Action
          </p>
          <div className="mt-3 flex items-start gap-3">
            <div className="mt-1 rounded-full bg-red-500/10 p-2 text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Delete this post?</h2>
              <p className="mt-2 text-sm text-white/65">
                <span className="font-semibold text-white">"{post.title}"</span> will be deleted
                permanently. This action cannot be restored again after you confirm it.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-mono text-red-200">
              Type this CAPTCHA to continue:
            </p>
            <p className="mt-2 text-2xl font-black tracking-[0.35em] text-white">{challenge}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-red-200">
              CAPTCHA
            </label>
            <input
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value.toUpperCase())}
              placeholder="Enter the code exactly"
              autoComplete="off"
              disabled={isDeleting}
              className="w-full rounded-xl border border-red-500/30 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/25"
            />
            <p className="mt-2 text-xs text-white/45">
              This extra step helps prevent accidental deletion.
            </p>
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canDelete || isDeleting}
              className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-black transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-white/15 px-4 py-3 font-semibold text-white/75 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default function UserProfile() {
  const [followerCount, setFollowerCount] = useState(3);
  const [userData,setuserData] =useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; user_name: string } | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteChallenge, setDeleteChallenge] = useState('');
  const [deleteAnswer, setDeleteAnswer] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [activePostFilter, setActivePostFilter] = useState<PostFilter>('published');
  const {username} = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    setActivePostFilter('published');
  }, [username]);

  useEffect(()=>{
    setLoading(true);
    setProgress(10);
    setIsFollowing(false);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fecthdata = async() => {
      try {
        const [res, meRes] = await Promise.all([
          api.get(`/api/users/${username}`),
          api.get("/auth/me", { withCredentials: true }).catch(() => null),
        ]);
        setuserData(res.data);
        setFollowerCount(res.data.total_followers ?? 0);
        setCurrentUser(meRes?.data ?? null);

        try {
          const followingRes = await api.get("/api/follow/following");
          const isUserFollowing = followingRes.data?.following?.some(
            (user: { id?: string }) => user.id === res.data.id
          );
          setIsFollowing(Boolean(isUserFollowing));
        } catch (followError) {
          console.error("Error in Following Api:", followError);
        }
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
    if (!userData?.id) return;
    const prevIsFollowing = isFollowing;
    const prevFollowerCount = followerCount;
    const optimisticIsFollowing = !prevIsFollowing;
    setIsFollowing(optimisticIsFollowing);
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
    setDeleteAnswer('');
    setDeleteError('');
  };

  const closeDeleteModal = () => {
    if (isDeletingPost) return;
    setPostToDelete(null);
    setDeleteChallenge('');
    setDeleteAnswer('');
    setDeleteError('');
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    if (deleteAnswer.trim().toUpperCase() !== deleteChallenge) {
      setDeleteError('Please type the CAPTCHA exactly before deleting.');
      return;
    }

    setIsDeletingPost(true);
    setDeleteError('');

    try {
      await api.delete(`/api/posts/${postToDelete.id}`, {
        withCredentials: true,
      });

      const deletedPostId = postToDelete.id;
      const deletedPostTitle = postToDelete.title?.trim() || 'Untitled Post';

      setuserData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          total_posts: Math.max(0, prev.total_posts - 1),
          posts: prev.posts.filter((post) => post.id !== deletedPostId),
        };
      });

      setPostToDelete(null);
      setDeleteChallenge('');
      setDeleteAnswer('');
      setDeleteError('');

      toast({
        title: "Post deleted",
        description: `"${deletedPostTitle}" was permanently removed.`,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete post.';
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

  const publishedPosts = (userData?.posts ?? []).filter((post) => post.status === 'published');
  const draftPosts = (userData?.posts ?? []).filter((post) => post.status === 'draft');
  const visiblePosts = isOwnProfile
    ? activePostFilter === 'draft'
      ? draftPosts
      : publishedPosts
    : publishedPosts;
  const visibleSectionTitle = isOwnProfile
    ? activePostFilter === 'draft'
      ? 'Draft Posts'
      : 'Published Posts'
    : 'Latest Posts';
  const visibleSectionDescription = isOwnProfile
    ? activePostFilter === 'draft'
      ? 'Only you can see these drafts. Click any draft to continue editing it.'
      : 'These are the posts visible to everyone.'
    : `Explore ${userData?.full_name}'s recent articles`;

  return (
    <div className="min-h-screen bg-black text-white">
      {loading && !hasLoadedOnce && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black">
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
                  <img
                    src={userData?.avatar_url}
                    alt={userData?.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
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
                {!isOwnProfile && (
                  <FollowButton
                    initialFollowerCount={userData?.total_followers ?? 0}
                    onFollowerCountChange={setFollowerCount}
                    onFollowClick={handleFollowClick}
                    initialIsFollowing={isFollowing}
                  />
                )}
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
                <div
                  className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300 cursor-pointer"
                  onClick={handleFollowersClick}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue/10 shape-hexagon translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                  <Users className="h-10 w-10 text-blue mb-4 relative z-10" />
                  <div className="text-5xl font-black text-white mb-2 relative z-10">{followerCount}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-400 font-mono relative z-10">Followers</div>
                </div>
              </div>

              {/* Following - Circle decoration */}
              <div className="stat-card">
                <div
                  className="bg-black border-2 border-blue/30 p-8 relative overflow-hidden group hover:border-blue transition-all duration-300 cursor-pointer"
                  onClick={handleFollowingClick}
                >
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
              <h2 className="text-4xl font-black uppercase tracking-tight">{visibleSectionTitle}</h2>
            </div>
            <p className="text-gray-400 ml-16 font-mono">{visibleSectionDescription}</p>
          </div>

          {isOwnProfile && (
            <div className="mb-10 flex flex-wrap items-center gap-3 ml-16">
              <button
                type="button"
                onClick={() => setActivePostFilter('published')}
                className={`rounded-full border px-5 py-2 text-sm font-mono uppercase tracking-[0.2em] transition-all ${
                  activePostFilter === 'published'
                    ? 'border-blue bg-blue/10 text-blue shadow-[0_0_20px_rgba(0,180,255,0.15)]'
                    : 'border-blue/20 text-gray-400 hover:border-blue/50 hover:text-white'
                }`}
              >
                Published ({publishedPosts.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePostFilter('draft')}
                className={`rounded-full border px-5 py-2 text-sm font-mono uppercase tracking-[0.2em] transition-all ${
                  activePostFilter === 'draft'
                    ? 'border-amber-300/50 bg-amber-300/10 text-amber-200 shadow-[0_0_20px_rgba(252,211,77,0.12)]'
                    : 'border-blue/20 text-gray-400 hover:border-blue/50 hover:text-white'
                }`}
              >
                Draft ({draftPosts.length})
              </button>
            </div>
          )}

          {visiblePosts.length === 0 && (
            <div className="ml-16 rounded-2xl border border-blue/20 bg-black/60 p-8 text-center">
              <p className="text-sm font-mono uppercase tracking-[0.3em] text-blue/70">
                {isOwnProfile && activePostFilter === 'draft' ? 'No Drafts Yet' : 'No Posts Yet'}
              </p>
              <p className="mt-3 text-gray-400">
                {isOwnProfile && activePostFilter === 'draft'
                  ? 'Your draft posts will appear here as you save them.'
                  : 'There are no posts to show in this section right now.'}
              </p>
            </div>
          )}

          {/* Posts Grid */}
          {visiblePosts.length > 0 && (
            <PostList
              posts={visiblePosts}
              canEdit={isOwnProfile}
              profileUsername={userData?.user_name}
              onDeletePost={openDeleteModal}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue/20 py-8 mt-20 relative">
        {/* Footer decorative shapes */}
        <div className="absolute top-0 left-20 w-16 h-16 bg-blue/8 shape-hexagon -translate-y-1/2" />
        <div className="absolute bottom-0 right-20 w-12 h-12 bg-blue/10 shape-pentagon" />
        
      </footer>

      {loading && hasLoadedOnce && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/35 backdrop-blur-sm">
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
              setDeleteError('');
            }
          }}
          onClose={closeDeleteModal}
          onConfirm={handleDeletePost}
        />
      )}
    </div>
  );
}
