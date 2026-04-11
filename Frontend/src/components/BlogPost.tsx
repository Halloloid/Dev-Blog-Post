import { type ReactNode, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  ArrowUpRight,
  CalendarDays,
  Eye,
  Github,
  Heart,
  MessageCircle,
  MessagesSquare,
  Pencil,
  Reply,
  Send,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Tag {
  id: string;
  slug: string;
  name: string;
}

interface CommentUser {
  id: string;
  user_name: string;
  avatar_url: string;
}

interface Author {
  id: string;
  full_name: string;
  user_name: string;
  avatar_url: string;
  bio?: string;
  total_followers: number;
}

interface PostComment {
  id: string;
  content: string;
  author: CommentUser;
  created_at: string;
  replisCount: number;
  replies: PostComment[];
}

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
  tags: Tag[];
}

interface BlogPostProps {
  post: BlogPostData;
  comments: PostComment[];
  onCommentPosted: () => Promise<void> | void;
}

const editorialCodeTheme = {
  'code[class*="language-"]': {
    color: "#f8fafc",
    background: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.96rem",
  },
  'pre[class*="language-"]': {
    color: "#f8fafc",
    background: "#0f172a",
    margin: 0,
  },
  comment: { color: "#94a3b8", fontStyle: "italic" },
  punctuation: { color: "#cbd5e1" },
  property: { color: "#f8fafc" },
  tag: { color: "#f59e0b", fontWeight: "700" },
  boolean: { color: "#38bdf8", fontWeight: "700" },
  number: { color: "#38bdf8" },
  constant: { color: "#67e8f9" },
  symbol: { color: "#f59e0b" },
  deleted: { color: "#f87171" },
  string: { color: "#86efac" },
  selector: { color: "#a78bfa" },
  "attr-name": { color: "#fda4af" },
  "attr-value": { color: "#86efac" },
  keyword: { color: "#c084fc", fontWeight: "800" },
  function: { color: "#fde68a", fontWeight: "700" },
  "class-name": { color: "#f8fafc", fontWeight: "700" },
  operator: { color: "#cbd5e1" },
  builtin: { color: "#93c5fd", fontWeight: "700" },
  variable: { color: "#f8fafc" },
  parameter: { color: "#e2e8f0" },
  method: { color: "#fde68a", fontWeight: "700" },
} as const;

const stripMarkdown = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/[>#*_~\-]/g, " ")
    .replace(/\n+/g, " ")
    .trim();

const estimateReadTime = (content: string) => {
  const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const getExcerpt = (post: BlogPostData) => {
  if (post.excerpt?.trim()) {
    return post.excerpt.trim();
  }

  const plainText = stripMarkdown(post.content);
  if (plainText.length <= 220) {
    return plainText;
  }

  return `${plainText.slice(0, 220).trim()}...`;
};

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();

const formatCompactDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const Avatar = ({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) => (
  <div
    className={cn(
      "relative shrink-0 overflow-hidden rounded-full border border-toffeebrown/15 bg-lightbronze/25",
      className
    )}
  >
    {src ? (
      <img src={src} alt={name} className="size-full object-cover" referrerPolicy="no-referrer" />
    ) : (
      <div className="flex size-full items-center justify-center text-sm font-black uppercase tracking-[0.08em] text-toffeebrown">
        {getInitials(name)}
      </div>
    )}
  </div>
);

const MetaChip = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <span className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-eggshell/18 bg-eggshell/10 px-3 py-2 text-center text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.14em] text-eggshell/84 sm:text-[0.72rem] sm:tracking-[0.16em]">
    {icon}
    <span className="wrap-break-word">{label}</span>
  </span>
);

const SidebarStat = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={cn("w-full min-w-0 max-w-full rounded-4xl border px-4 py-4", className)}>
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/52">{label}</p>
    <p className="mt-2 text-2xl font-black uppercase tracking-[-0.05em] text-toffeebrown">{value}</p>
  </div>
);

function BlogPost({ post, comments, onCommentPosted }: BlogPostProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [isLiking, setIsLiking] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [repliesMap, setRepliesMap] = useState<Record<string, PostComment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<{ commentId: string; replyId: string } | null>(null);
  const [editText, setEditText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        setCurrentUserId(res.data?.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLikeCount = async () => {
      try {
        const res = await api.get(`/api/likes/posts/${post.id}/count`);
        if (isMounted) {
          setLikeCount(res.data?.count ?? post.likes_count);
        }
      } catch {
        if (isMounted) {
          setLikeCount(post.likes_count);
        }
      }
    };

    fetchLikeCount();
    setLiked(false);

    return () => {
      isMounted = false;
    };
  }, [post.id, post.likes_count]);

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const res = await api.get(`/api/likes/posts/${post.id}/check`, { withCredentials: true });
        setLiked(Boolean(res.data?.isLikedby));
      } catch {
        setLiked(false);
      }
    };

    if (!currentUserId) {
      setLiked(false);
      return;
    }

    fetchLiked();
  }, [currentUserId, post.id]);

  const onAuthorClick = (userName: string) => {
    navigate(`/profile/${userName}`);
  };

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;

    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;

    setLiked(nextLiked);
    setLikeCount(Math.max(0, likeCount + delta));
    setIsLiking(true);

    try {
      const res = await api.post(
        "/api/likes",
        { postId: post.id, action: nextLiked ? "like" : "unlike" },
        { withCredentials: true }
      );

      if (!res.data) {
        throw new Error("Like toggle failed");
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      setLoadingReplies((prev) => new Set(prev).add(commentId));
      const res = await api.get(`/api/replies/${commentId}`);
      const repliesArray = res.data.data ?? [];

      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: repliesArray,
      }));
    } catch (error) {
      console.error("Failed to fetch replies", error);
    } finally {
      setLoadingReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const postComment = async (postId: string) => {
    if (!comment.trim() || isPostingComment || !currentUserId) return;

    try {
      setIsPostingComment(true);
      await api.post(`/api/comments/${postId}/post`, { content: comment });
      setComment("");
      await onCommentPosted();
    } catch (error) {
      console.error("Fail to make a comment", error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const updateComment = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      await api.patch(`/api/comments/${commentId}`, { content: editText });
      await onCommentPosted();
      setEditingCommentId(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const deleteComment = async (commentId: string) => {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    try {
      await api.delete(`/api/comments/${commentId}`);
      await onCommentPosted();
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const updateReply = async (commentId: string, replyId: string) => {
    if (!editText.trim()) return;
    try {
      await api.patch(`/api/replies/${replyId}`, { content: editText });
      await fetchReplies(commentId);
      setEditingReply(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update reply", error);
    }
  };

  const deleteReply = async (commentId: string, replyId: string) => {
    const confirmed = window.confirm("Delete this reply?");
    if (!confirmed) return;

    try {
      await api.delete(`/api/replies/${replyId}`);
      await fetchReplies(commentId);
    } catch (error) {
      console.error("Failed to delete reply", error);
    }
  };

  const postReply = async (commentId: string) => {
    if (!replyText.trim() || !currentUserId) return;

    try {
      await api.post(`/api/replies/${commentId}`, { content: replyText });
      setReplyText("");
      setVisibleReplies((prev) => new Set(prev).add(commentId));
      await fetchReplies(commentId);
    } catch (error) {
      console.error("Failed to post reply", error);
    }
  };

  const excerpt = getExcerpt(post);
  const readTime = estimateReadTime(post.content);
  const articleIssue = post.id.slice(0, 6).toUpperCase();

  const renderReplyCard = (reply: PostComment, parentCommentId: string) => (
    <div key={reply.id} className="rounded-[1.2rem] border border-toffeebrown/12 bg-eggshell/70 p-3.5 sm:rounded-[1.35rem] sm:p-4">
      <div className="flex items-start gap-3">
        <Avatar src={reply.author.avatar_url} name={reply.author.user_name} className="size-10" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onAuthorClick(reply.author.user_name)}
              className="text-sm font-semibold tracking-[0.08em] text-rossycopper hover:text-toffeebrown"
            >
              @{reply.author.user_name}
            </button>
            <span className="rounded-full border border-toffeebrown/10 bg-lightbronze/18 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-toffeebrown/60">
              {formatCompactDate(reply.created_at)}
            </span>
            {currentUserId === reply.author?.id && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReply({ commentId: parentCommentId, replyId: reply.id });
                    setEditingCommentId(null);
                    setEditText(reply.content);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-toffeebrown/10 text-toffeebrown/60 transition-colors hover:border-skyreflection/35 hover:bg-skyreflection/12 hover:text-toffeebrown"
                  aria-label="Edit reply"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteReply(parentCommentId, reply.id)}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-toffeebrown/10 text-toffeebrown/60 transition-colors hover:border-rossycopper/30 hover:bg-rossycopper/10 hover:text-rossycopper"
                  aria-label="Delete reply"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {editingReply?.replyId === reply.id ? (
            <div className="mt-3 space-y-3">
              <textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                className="w-full rounded-3xl border border-toffeebrown/15 bg-eggshell px-4 py-3 text-sm leading-6 text-toffeebrown outline-none transition-colors placeholder:text-toffeebrown/40 focus:border-skyreflection resize-none"
                rows={3}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full bg-skyreflection px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown"
                  onClick={() => updateReply(parentCommentId, reply.id)}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="rounded-full border border-toffeebrown/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown/70"
                  onClick={() => {
                    setEditingReply(null);
                    setEditText("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-toffeebrown/76 sm:leading-7">{reply.content}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderComments = (commentsList: PostComment[]) => (
    <div className="space-y-5">
      {commentsList.map((entry, index) => {
        const repliesVisible = visibleReplies.has(entry.id);
        const replyCount = repliesMap[entry.id]?.length ?? entry.replisCount;

        return (
          <div
            key={entry.id}
            className={cn(
              "rounded-[1.35rem] border p-4 sm:rounded-[1.6rem] sm:p-6",
              index % 2 === 0
                ? "border-toffeebrown/12 bg-eggshell/90"
                : "border-skyreflection/20 bg-skyreflection/8"
            )}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <Avatar src={entry.author.avatar_url} name={entry.author.user_name} className="size-10 sm:size-12" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => onAuthorClick(entry.author.user_name)}
                    className="text-sm font-semibold tracking-[0.08em] text-rossycopper hover:text-toffeebrown"
                  >
                    @{entry.author.user_name}
                  </button>
                  <span className="rounded-full border border-toffeebrown/10 bg-lightbronze/18 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-toffeebrown/60">
                    {formatCompactDate(entry.created_at)}
                  </span>
                  {currentUserId === entry.author.id && (
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(entry.id);
                          setEditingReply(null);
                          setEditText(entry.content);
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-toffeebrown/10 text-toffeebrown/60 transition-colors hover:border-skyreflection/35 hover:bg-skyreflection/12 hover:text-toffeebrown"
                        aria-label="Edit comment"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteComment(entry.id)}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-toffeebrown/10 text-toffeebrown/60 transition-colors hover:border-rossycopper/30 hover:bg-rossycopper/10 hover:text-rossycopper"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === entry.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      className="w-full rounded-3xl border border-toffeebrown/15 bg-eggshell px-4 py-3 text-sm leading-6 text-toffeebrown outline-none transition-colors placeholder:text-toffeebrown/40 focus:border-skyreflection resize-none"
                      rows={4}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-skyreflection px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown"
                        onClick={() => updateComment(entry.id)}
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-toffeebrown/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown/70"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-[0.96rem] leading-7 text-toffeebrown/78 sm:text-[0.98rem] sm:leading-8">{entry.content}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(replyingTo === entry.id ? null : entry.id)}
                    disabled={!currentUserId}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                      currentUserId
                        ? "border-toffeebrown/12 bg-eggshell text-toffeebrown hover:border-skyreflection/30 hover:bg-skyreflection/10"
                        : "cursor-not-allowed border-toffeebrown/10 bg-eggshell/70 text-toffeebrown/40"
                    )}
                  >
                    <Reply size={14} />
                    Reply
                  </button>

                  {(entry.replisCount > 0 || (repliesMap[entry.id]?.length ?? 0) > 0) && (
                    <button
                      type="button"
                      onClick={async () => {
                        const nextVisible = new Set(visibleReplies);
                        if (repliesVisible) {
                          nextVisible.delete(entry.id);
                        } else {
                          nextVisible.add(entry.id);
                          if (!repliesMap[entry.id]) {
                            await fetchReplies(entry.id);
                          }
                        }
                        setVisibleReplies(nextVisible);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-toffeebrown/12 bg-eggshell px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-toffeebrown/70 transition-colors hover:border-lightbronze/35 hover:bg-lightbronze/14 hover:text-toffeebrown"
                    >
                      <MessageCircle size={14} />
                      {repliesVisible ? "Hide Replies" : `View Replies (${replyCount})`}
                    </button>
                  )}
                </div>

                {replyingTo === entry.id && (
                  <form
                    className="mt-4 rounded-[1.15rem] border border-toffeebrown/12 bg-eggshell/75 p-3.5 sm:rounded-4xl sm:p-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      postReply(entry.id);
                    }}
                  >
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Add a thoughtful reply..."
                      disabled={!currentUserId}
                      className="w-full rounded-3xl border border-toffeebrown/15 bg-eggshell px-4 py-3 text-sm leading-6 text-toffeebrown outline-none transition-colors placeholder:text-toffeebrown/40 focus:border-skyreflection resize-none disabled:cursor-not-allowed disabled:bg-eggshell/70"
                      rows={3}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="rounded-full bg-skyreflection px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!replyText.trim() || !currentUserId}
                      >
                        Send Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="rounded-full border border-toffeebrown/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown/70"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {repliesVisible && (
                  <div className="mt-4 space-y-3 border-l border-rossycopper/18 pl-3 sm:pl-4">
                    {loadingReplies.has(entry.id) && (
                      <p className="text-sm text-toffeebrown/55">Loading replies...</p>
                    )}
                    {!loadingReplies.has(entry.id) &&
                      repliesMap[entry.id]?.map((reply) => renderReplyCard(reply, entry.id))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-eggshell text-toffeebrown">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-lightbronze/28 blur-3xl" />
        <div className="absolute right-0 top-8 h-80 w-80 rounded-full bg-skyreflection/22 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rossycopper/12 blur-3xl" />
      </div>

      <section className="relative overflow-hidden border-b border-toffeebrown/10 bg-rossycopper text-eggshell">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-skyreflection)_0%,transparent_38%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-lightbronze)_0%,transparent_36%)] opacity-20" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-[calc(var(--app-navbar-height,0px)+1rem)] sm:px-6 lg:px-8 lg:pb-14 lg:pt-[calc(var(--app-navbar-height,0px)+1.5rem)]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-eggshell/18 bg-eggshell/10 px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-eggshell/84">
              <Sparkles className="size-3.5" />
              Reading Room
            </span>
            <span className="rounded-full border border-eggshell/18 bg-eggshell/10 px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-eggshell/78">
              Issue {articleIssue}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)] lg:items-start lg:gap-8">
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={tag.id}
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] sm:px-3 sm:text-[0.72rem] sm:tracking-[0.16em]",
                      index % 3 === 0
                        ? "border-eggshell/20 bg-eggshell/10 text-eggshell"
                        : index % 3 === 1
                          ? "border-skyreflection/35 bg-skyreflection/16 text-eggshell"
                          : "border-lightbronze/35 bg-lightbronze/16 text-eggshell"
                    )}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                <h1 className="max-w-5xl text-[clamp(2.2rem,9vw,5.8rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-balance sm:leading-[0.88] sm:tracking-[-0.06em]">
                  {post.title}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-eggshell/84 sm:text-xl sm:leading-8">
                  {excerpt}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <MetaChip icon={<CalendarDays className="size-3.5" />} label={formatFullDate(post.created_at)} />
                <MetaChip icon={<Eye className="size-3.5" />} label={`${post.view_count.toLocaleString()} views`} />
                <MetaChip icon={<Heart className="size-3.5" />} label={`${likeCount.toLocaleString()} likes`} />
                <MetaChip icon={<MessagesSquare className="size-3.5" />} label={`${readTime} min read`} />
              </div>
            </div>

            <div className="relative min-w-0">
              <div className="absolute -inset-1.5 rounded-[1.8rem] border border-eggshell/12 bg-eggshell/8 rotate-[-1.5deg] sm:-inset-3 sm:rounded-[2.3rem] sm:rotate-[-2.5deg]" />
              <div className="relative overflow-hidden rounded-[1.65rem] border border-eggshell/18 bg-eggshell/10 p-2.5 backdrop-blur-sm sm:rounded-[2rem] sm:p-3">
                {post.featured_img ? (
                  <div className="relative overflow-hidden rounded-[1.2rem] sm:rounded-[1.5rem]">
                    <img src={post.featured_img} alt={post.title} className="aspect-4/5 w-full object-cover sm:aspect-16/11 lg:aspect-4/5" />
                    <div className="absolute inset-0 bg-linear-to-t from-toffeebrown/45 via-transparent to-eggshell/8" />
                  </div>
                ) : (
                  <div className="flex aspect-4/5 items-end rounded-[1.2rem] bg-linear-to-br from-lightbronze via-eggshell to-skyreflection p-5 sm:aspect-16/11 sm:rounded-[1.5rem] sm:p-6 lg:aspect-4/5">
                    <span className="text-[3.2rem] font-black uppercase leading-none tracking-[-0.08em] text-toffeebrown/70 sm:text-[4rem]">
                      {post.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onAuthorClick(post.user.user_name)}
                  className="mt-3 flex w-full items-center gap-3 rounded-[1.2rem] border border-eggshell/18 bg-eggshell/10 p-3.5 text-left transition-colors hover:bg-eggshell/14 sm:rounded-[1.35rem] sm:p-4"
                >
                  <Avatar src={post.user.avatar_url} name={post.user.full_name || post.user.user_name} className="size-12 border-eggshell/20" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-eggshell">
                      {post.user.full_name}
                    </p>
                    <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-eggshell/68">
                      @{post.user.user_name}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-14">
        <aside className="order-1 w-full min-w-0 lg:order-1">
          <div className="space-y-4 lg:sticky lg:top-[calc(var(--app-navbar-height,0px)+1.5rem)]">
            <section className="w-full max-w-full rounded-[1.5rem] border border-toffeebrown/15 bg-eggshell/82 p-4 shadow-[0_18px_55px_rgba(158,98,64,0.08)] backdrop-blur-sm sm:rounded-[1.75rem] sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">Reading Pulse</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <SidebarStat label="Read Time" value={`${readTime} min`} className="border-lightbronze/30 bg-lightbronze/16" />
                <SidebarStat label="Views" value={post.view_count.toLocaleString()} className="border-skyreflection/30 bg-skyreflection/16" />
                <SidebarStat label="Likes" value={likeCount.toLocaleString()} className="border-rossycopper/18 bg-rossycopper/10" />
                <SidebarStat label="Replies" value={post.comments_count.toString()} className="border-toffeebrown/15 bg-toffeebrown/6" />
              </div>
            </section>

            <section className="w-full max-w-full rounded-[1.5rem] border border-toffeebrown/15 bg-eggshell/82 p-4 shadow-[0_18px_55px_rgba(158,98,64,0.08)] backdrop-blur-sm sm:rounded-[1.75rem] sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">Quick Actions</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={isLiking || !currentUserId}
                  className={cn(
                    "inline-flex w-full min-w-0 items-center justify-between gap-3 rounded-full border px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition-colors sm:w-auto lg:w-full",
                    liked
                      ? "border-rossycopper bg-rossycopper text-eggshell"
                      : "border-toffeebrown/15 bg-eggshell text-toffeebrown hover:border-rossycopper/30 hover:bg-lightbronze/18",
                    (isLiking || !currentUserId) && "cursor-not-allowed opacity-60"
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 wrap-break-word">
                    <Heart size={16} fill={liked ? "currentColor" : "none"} />
                    {liked ? "Liked" : "Like Post"}
                  </span>
                  <span>{likeCount}</span>
                </button>

                <a
                  href="#comments"
                  className="inline-flex w-full min-w-0 items-center justify-between gap-3 rounded-full border border-toffeebrown/15 bg-eggshell px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown transition-colors hover:border-skyreflection/35 hover:bg-skyreflection/14 sm:w-auto lg:w-full"
                >
                  <span className="inline-flex min-w-0 items-center gap-2 wrap-break-word">
                    <MessageCircle size={16} />
                    Jump To Notes
                  </span>
                  <ArrowUpRight size={16} />
                </a>

                {post.repo_link && (
                  <a
                    href={post.repo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full min-w-0 items-center justify-between gap-3 rounded-full border border-toffeebrown/15 bg-eggshell px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-toffeebrown transition-colors hover:border-lightbronze/35 hover:bg-lightbronze/14 sm:w-auto lg:w-full"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2 wrap-break-word">
                      <Github size={16} />
                      View Repo
                    </span>
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
              {!currentUserId && (
                <p className="mt-4 text-sm leading-6 text-toffeebrown/58">
                  Sign in to like the post or join the discussion.
                </p>
              )}
            </section>
          </div>
        </aside>

        <main className="order-2 w-full min-w-0 space-y-8 sm:space-y-10 lg:order-2">
          <article className="w-full max-w-full overflow-hidden rounded-[1.7rem] border border-toffeebrown/15 bg-eggshell/92 shadow-[0_24px_70px_rgba(158,98,64,0.1)] sm:rounded-[2rem]">
            <div className="border-b border-toffeebrown/10 bg-lightbronze/10 px-4 py-5 sm:px-8 lg:px-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">Story</p>
                </div>
                <div className="rounded-full border border-toffeebrown/12 bg-eggshell/80 px-4 py-2 text-sm font-semibold text-toffeebrown/68">
                  Published {formatFullDate(post.created_at)}
                </div>
              </div>
            </div>

            <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div className="mb-6 rounded-[1.45rem] border border-lightbronze/25 bg-lightbronze/12 p-4 sm:mb-8 sm:rounded-[1.75rem] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">If You Only Read One Line</p>
                <p className="mt-3 text-lg leading-8 text-toffeebrown sm:text-xl">{excerpt}</p>
              </div>

              <article className="max-w-none min-w-0">
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline ? (
                        <div className="my-8 w-full max-w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-toffeebrown/12">
                          <div className="flex items-center justify-between gap-3 border-b border-toffeebrown/10 bg-lightbronze/10 px-3 py-3 sm:px-4">
                            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/58">
                              {match?.[1] ?? "snippet"}
                            </span>
                            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/42">
                              Code Block
                            </span>
                          </div>
                          <SyntaxHighlighter
                            style={editorialCodeTheme as any}
                            language={match?.[1] ?? "text"}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              background: "#0f172a",
                              padding: "1rem 1rem",
                              borderRadius: 0,
                              fontSize: "0.96rem",
                              lineHeight: "1.75",
                              overflowX: "auto",
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="wrap-break-word rounded-md bg-toffeebrown px-1.5 py-0.5 text-[0.92em] text-eggshell" {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }: any) => <h1 className="mt-10 wrap-break-word text-[clamp(1.85rem,7vw,3.6rem)] font-black uppercase leading-[0.96] tracking-[-0.04em] text-toffeebrown sm:mt-12 sm:leading-[0.94] sm:tracking-[-0.05em]">{children}</h1>,
                    h2: ({ children }: any) => <h2 className="mt-10 wrap-break-word text-[clamp(1.55rem,6vw,2.9rem)] font-black uppercase leading-none tracking-[-0.03em] text-rossycopper sm:mt-12 sm:leading-[0.96] sm:tracking-[-0.04em]">{children}</h2>,
                    h3: ({ children }: any) => <h3 className="mt-8 wrap-break-word text-[clamp(1.2rem,5vw,2rem)] font-black uppercase tracking-[-0.02em] text-toffeebrown sm:mt-10 sm:tracking-[-0.03em]">{children}</h3>,
                    p: ({ children }: any) => <p className="mt-5 wrap-break-word text-[0.98rem] leading-7 text-toffeebrown/80 sm:mt-6 sm:text-[1.08rem] sm:leading-8">{children}</p>,
                    a: ({ href, children }: any) => <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer noopener" : undefined} className="break-all font-semibold text-rossycopper underline decoration-rossycopper/35 underline-offset-4 transition-colors hover:text-toffeebrown">{children}</a>,
                    ul: ({ children }: any) => <ul className="mt-6 ml-5 list-disc space-y-3 marker:text-rossycopper">{children}</ul>,
                    ol: ({ children }: any) => <ol className="mt-6 ml-5 list-decimal space-y-3 marker:text-rossycopper">{children}</ol>,
                    li: ({ children }: any) => <li className="wrap-break-word pl-1 text-[0.98rem] leading-7 text-toffeebrown/80 sm:text-[1rem] sm:leading-8">{children}</li>,
                    strong: ({ children }: any) => <strong className="font-bold text-rossycopper">{children}</strong>,
                    blockquote: ({ children }: any) => <blockquote className="my-8 wrap-break-word rounded-[1.2rem] border-l-4 border-rossycopper bg-lightbronze/14 px-4 py-4 text-base italic leading-7 text-toffeebrown sm:rounded-[1.5rem] sm:px-6 sm:py-5 sm:text-lg sm:leading-8">{children}</blockquote>,
                    hr: () => <hr className="my-10 border-toffeebrown/12" />,
                    img: ({ src, alt }: any) => <div className="my-8 w-full max-w-full overflow-hidden rounded-[1.3rem] border border-toffeebrown/12 bg-eggshell/78 p-2 sm:rounded-[1.6rem]"><img src={src} alt={alt ?? "Post image"} className="w-full max-w-full rounded-3xl object-cover sm:rounded-[1.2rem]" /></div>,
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </article>

              <div className="mt-8 rounded-[1.5rem] border border-toffeebrown/15 bg-toffeebrown p-4 text-eggshell sm:mt-10 sm:rounded-[1.75rem] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-eggshell/58">Keep The Thread Going</p>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-eggshell/78">
                      Leave a note, tap like, or jump into the repo behind the post.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleLike}
                      disabled={isLiking || !currentUserId}
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition-colors sm:w-auto",
                        liked ? "border-eggshell bg-eggshell text-toffeebrown" : "border-eggshell/18 bg-eggshell/10 text-eggshell hover:bg-eggshell/18",
                        (isLiking || !currentUserId) && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <Heart size={16} fill={liked ? "currentColor" : "none"} />
                      {likeCount.toLocaleString()}
                    </button>
                    <a href="#comments" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-eggshell/18 bg-eggshell/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-eggshell transition-colors hover:bg-eggshell/18 sm:w-auto">
                      <MessageCircle size={16} />
                      Discuss
                    </a>
                    {post.repo_link && (
                      <a href={post.repo_link} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-eggshell/18 bg-eggshell/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-eggshell transition-colors hover:bg-eggshell/18 sm:w-auto">
                        <Github size={16} />
                        Repo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>

          <section id="comments" className="w-full max-w-full overflow-hidden rounded-[1.7rem] border border-toffeebrown/15 bg-eggshell/90 shadow-[0_20px_60px_rgba(158,98,64,0.08)] sm:rounded-[2rem]">
            <div className="border-b border-toffeebrown/10 bg-skyreflection/10 px-4 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">Discussion</p>
                  <h2 className="mt-2 text-[clamp(1.8rem,4.5vw,3.1rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">Reader Notes</h2>
                </div>
                <div className="rounded-full border border-toffeebrown/12 bg-eggshell/80 px-4 py-2 text-sm font-semibold text-toffeebrown/72">
                  {post.comments_count} comments
                </div>
              </div>
            </div>

            <div className="px-4 py-5 sm:px-8 sm:py-6">
              <form
                className="rounded-[1.45rem] border border-toffeebrown/15 bg-lightbronze/10 p-4 sm:rounded-[1.75rem] sm:p-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  postComment(post.id);
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">Add A Note</p>
                    <p className="mt-2 text-sm leading-7 text-toffeebrown/68">
                      Thoughtful comments make even a rough draft feel more alive.
                    </p>
                  </div>
                  {!currentUserId && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-toffeebrown/12 bg-eggshell/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-toffeebrown/58">
                      <UserRound size={14} />
                      Sign in to comment
                    </div>
                  )}
                </div>

                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your thoughts..."
                  className="mt-4 w-full rounded-4xl border border-toffeebrown/15 bg-eggshell px-4 py-4 text-sm leading-7 text-toffeebrown outline-none transition-colors placeholder:text-toffeebrown/40 focus:border-skyreflection resize-none disabled:cursor-not-allowed disabled:bg-eggshell/75"
                  rows={5}
                  disabled={isPostingComment || !currentUserId}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-toffeebrown/55">Keep it constructive, clear, and worth someone else reading.</p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-rossycopper px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-eggshell transition-colors hover:bg-toffeebrown disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPostingComment || !comment.trim() || !currentUserId}
                  >
                    <Send size={16} />
                    {isPostingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>

              <div className="mt-8">
                {comments.length > 0 ? renderComments(comments) : (
                  <div className="rounded-[1.45rem] border border-toffeebrown/12 bg-eggshell/75 px-4 py-10 text-center sm:rounded-[1.75rem] sm:px-6 sm:py-12">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/48">No Notes Yet</p>
                    <p className="mt-3 text-base leading-7 text-toffeebrown/68">
                      Be the first person to leave a thoughtful comment on this post.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default BlogPost;
