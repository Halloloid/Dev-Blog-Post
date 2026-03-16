import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Heart, Eye, MessageCircle, Github, Reply } from 'lucide-react';
import api from '@/config/api';
import { useNavigate } from 'react-router-dom';

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

function BlogPost({ post, comments, onCommentPosted }: BlogPostProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [visibleReplies, setVisibleReplies] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [repliesMap, setRepliesMap] = useState<Record<string, PostComment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [isPostingComment, setIsPostingComment] = useState(false);
  const navigate = useNavigate()

  const onAuthorClick = async (user_name: string) => {
    navigate(`/profile/${user_name}`)
  }

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      setLoadingReplies((prev) => new Set(prev).add(commentId));
      const res = await api.get(`/api/replies/${commentId}`)

      const repliesArray = res.data.data ?? [];

      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: repliesArray, // assuming API returns array of replies
      }));
    } catch (err) {
      console.error("Failed to fetch replies", err);
    } finally {
      setLoadingReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const postComment = async (postId: string) => {
    if (!comment.trim() || isPostingComment) return;
    try {
      setIsPostingComment(true);
      await api.post(`/api/comments/${postId}/post`, {
        content: comment,
      })
      setComment('');
      await onCommentPosted();
    } catch (error) {
      console.error("Fail to Make a Comment",error)
    } finally {
      setIsPostingComment(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderComments = (commentsList: PostComment[]) => {
    return (
      <div className="space-y-6">
        {commentsList.map((comment) => {
          const repliesVisible = visibleReplies.has(comment.id);

          return (
            <div key={comment.id}>
              <div className="border border-gray-800 rounded-lg p-6 bg-black/30">
                <div className="flex items-start gap-4">
                  <img src={comment.author.avatar_url} className='w-10 h-10 rounded-full flex items-center justify-center' />


                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-land hover:underline" onClick={() => onAuthorClick(comment.author.user_name)}>
                        {comment.author.user_name}
                      </span>
                      <span className="text-sm text-gray-500 font-mono">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-3">
                      {comment.content}
                    </p>

                    {/* Reply Button */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          )
                        }
                        className="flex items-center gap-2 text-sm text-vio hover:text-land transition-colors font-mono"
                      >
                        <Reply size={16} />
                        Reply
                      </button>

                      {comment.replisCount > 0 && (
                        <button
                          onClick={async () => {
                            const newSet = new Set(visibleReplies);

                            if (repliesVisible) {
                              newSet.delete(comment.id);
                            } else {
                              newSet.add(comment.id);

                              // Fetch only if not already fetched
                              if (!repliesMap[comment.id]) {
                                await fetchReplies(comment.id);
                              }
                            }

                            setVisibleReplies(newSet);
                          }}
                          className="text-sm text-gray-400 hover:text-land font-mono"
                        >
                          {repliesVisible
                            ? "Hide replies"
                            : `View replies (${comment.replisCount})`}
                        </button>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form
                        className="mt-4 pt-4 border-t border-gray-700"
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <textarea
                          value={replyText}
                          onChange={(e) =>
                            setReplyText(e.target.value)
                          }
                          placeholder="Write a reply..."
                          className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg p-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-land transition-all resize-none font-mono text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-land text-black font-bold rounded text-sm"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="px-4 py-2 border border-gray-700 text-gray-400 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Replies Section (Only 1 Level) */}
                    {repliesVisible && comment.replisCount > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-vio/30 pl-4">

                        {loadingReplies.has(comment.id) && (
                          <p className="text-sm text-gray-500 font-mono">Loading replies...</p>
                        )}

                        {!loadingReplies.has(comment.id) &&
                          repliesMap[comment.id]?.map((reply) => (
                            <div
                              key={reply.id}
                              className="border border-gray-800 rounded-lg p-4 bg-black/20"
                            >
                              <div className="flex items-start gap-3">

                                {/* Avatar */}
                                <img
                                  src={reply.author?.avatar_url}
                                  alt={reply.author?.user_name}
                                  className="w-8 h-8 rounded-full"
                                />

                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-vio hover:underline" onClick={() => onAuthorClick(reply.author.user_name)}>
                                      {reply.author.user_name}
                                    </span>
                                    <span className="text-sm text-gray-500 font-mono">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>

                                  <p className="text-gray-300 text-sm">
                                    {reply.content}
                                  </p>
                                </div>

                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="hero-section relative h-125 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.featured_img})` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-[#0a0a0a]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={tag.id}
                className={`px-3 py-1 text-xs font-mono border rounded-full ${index % 2 === 0
                    ? 'border-land text-land shadow-[0_0_10px_rgba(44,255,5,0.3)]'
                    : 'border-vio text-vio shadow-[0_0_10px_rgba(255,0,255,0.3)]'
                  }`}
              >
                {tag.name}
              </span>
            ))}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-land drop-shadow-[0_0_20px_rgba(44,255,5,0.5)]">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-400 font-mono">
            <span className="text-vio">{post.user.user_name}</span>
            <span>•</span>
            <span>{formatDate(post.created_at)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye size={16} /> {post.view_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={16} /> {likeCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={16} /> {post.comments_count}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={{
                      ...vscDarkPlus,
                      'pre[class*="language-"]': {
                        background: '#0d0d0d',
                        border: '1px solid #2CFF05',
                        boxShadow: '0 0 20px rgba(44, 255, 5, 0.1)',
                      },
                    }}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      background: '#0d0d0d',
                      border: '1px solid #2CFF05',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      fontSize: '0.9rem',
                      boxShadow: '0 0 20px rgba(44, 255, 5, 0.1)',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-[#0d0d0d] text-land px-2 py-1 rounded border border-land/30" {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-4xl font-bold mt-12 mb-6 text-land drop-shadow-[0_0_10px_rgba(44,255,5,0.3)]">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-3xl font-bold mt-10 mb-5 text-vio drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-bold mt-8 mb-4 text-land">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 leading-relaxed mb-6">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-none space-y-2 my-6">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start">
                  <span className="text-land mr-3">▹</span>
                  <span className="text-gray-300">{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="text-vio font-bold">
                  {children}
                </strong>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all ${liked
                    ? 'border-vio text-vio bg-vio/10 shadow-[0_0_20px_rgba(255,0,255,0.3)]'
                    : 'border-gray-700 text-gray-400 hover:border-vio hover:text-vio'
                  }`}
              >
                <Heart size={20} fill={liked ? '#FF00FF' : 'none'} />
                <span className="font-mono">{likeCount.toLocaleString()}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-400 font-mono">
                <Eye size={20} />
                <span>{post.view_count.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400 font-mono">
                <MessageCircle size={20} />
                <span>{post.comments_count}</span>
              </div>
            </div>

            <a
              href={post.repo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-land text-land hover:bg-land/10 transition-all shadow-[0_0_10px_rgba(44,255,5,0.2)] hover:shadow-[0_0_20px_rgba(44,255,5,0.4)]"
            >
              <Github size={20} />
              <span className="font-mono">View Repo</span>
            </a>
          </div>
        </div>

        {/* ================= Author Card ================= */}
        <div className="mt-16 border border-vio/30 rounded-xl p-8 bg-black/40 backdrop-blur-sm " onClick={() => onAuthorClick(post.user.user_name)}>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

            {/* Avatar */}
            <div className="relative">
              <img
                src={post.user.avatar_url}
                alt={post.user.user_name}
                className="w-24 h-24 rounded-full border-2 border-land "
              />
              <div className="absolute inset-0 rounded-full border border-vio/40 animate-pulse" />
            </div>

            {/* Author Info */}
            <div className="flex-1" >
              <h3 className="text-2xl font-bold text-land">
                {post.user.full_name}
              </h3>

              <p className="text-vio font-mono text-sm hover:underline">
                @{post.user.user_name}
              </p>

              {post.user.bio && (
                <p className="text-gray-400 mt-3 max-w-xl">
                  {post.user.bio}
                </p>
              )}

              <div className="mt-4 text-sm text-gray-500 font-mono">
                {post.user.total_followers} followers
              </div>
            </div>

          </div>
        </div>
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-land drop-shadow-[0_0_10px_rgba(44,255,5,0.3)]">
            Comments ({post.comments_count})
          </h2>

          <div className="mb-8">
            {renderComments(comments)}
          </div>

          <form
            className="border border-land/30 rounded-lg p-6 bg-black/30"
            onSubmit={(e) => {
              e.preventDefault();
              postComment(post.id);
            }}
          >
            <h3 className="text-xl font-bold mb-4 text-land">Add a comment</h3>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-land focus:shadow-[0_0_10px_rgba(44,255,5,0.2)] transition-all resize-none font-mono"
              rows={4}
              disabled={isPostingComment}
            />

            <button
              type="submit"
              className="mt-4 px-8 py-3 bg-land text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(44,255,5,0.5)] transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isPostingComment || !comment.trim()}
            >
              {isPostingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BlogPost;
