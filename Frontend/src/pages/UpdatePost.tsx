import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AlertCircle, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/config/api';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';

interface FormErrors {
  title?: string;
  content?: string;
  repoLink?: string;
  excerpt?: string;
}

interface EditFormData {
  title: string;
  content: string;
  repoLink: string;
  excerpt: string;
}

interface EditablePostResponse {
  id: string;
  title: string | null;
  content: string | null;
  exceprt: string | null;
  repo_link: string | null;
  user?: {
    user_name?: string | null;
  };
}

function UpdatePost() {
  const navigate = useNavigate();
  const { id, username } = useParams<{ id: string; username: string }>();

  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    content: '',
    repoLink: '',
    excerpt: '',
  });
  const [initialFormData, setInitialFormData] = useState<EditFormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(10);

  const normalizedFormData = useMemo(
    () => ({
      title: formData.title.trim(),
      content: formData.content.trim(),
      repoLink: formData.repoLink.trim(),
      excerpt: formData.excerpt.trim(),
    }),
    [formData]
  );

  const hasChanges = useMemo(() => {
    if (!initialFormData) return false;

    return (
      normalizedFormData.title !== initialFormData.title.trim() ||
      normalizedFormData.content !== initialFormData.content.trim() ||
      normalizedFormData.repoLink !== initialFormData.repoLink.trim() ||
      normalizedFormData.excerpt !== initialFormData.excerpt.trim()
    );
  }, [initialFormData, normalizedFormData]);

  const previewContent =
    formData.content || '# Start updating your content...\n\nYour markdown preview will appear here.';
  const parsedContent = previewContent.replace(/\\n/g, '\n');

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!normalizedFormData.title) {
      newErrors.title = 'Title is required';
    }

    if (!normalizedFormData.content) {
      newErrors.content = 'Content is required';
    }

    if (!normalizedFormData.repoLink) {
      newErrors.repoLink = 'GitHub repo link is required';
    } else if (!normalizedFormData.repoLink.startsWith('https://github.com/')) {
      newErrors.repoLink = 'Please enter a valid GitHub URL';
    }

    if (!normalizedFormData.excerpt) {
      newErrors.excerpt = 'Excerpt is required';
    }

    setErrors(newErrors);
    return newErrors;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) {
      setApiError('Missing post id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiError('');
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fetchEditablePost = async () => {
      try {
        const response = await api.get<EditablePostResponse>(`/api/posts/${id}/edit`, {
          withCredentials: true,
        });

        const post = response.data;
        const nextFormData = {
          title: post.title ?? '',
          content: post.content ?? '',
          repoLink: post.repo_link ?? '',
          excerpt: post.exceprt ?? '',
        };

        setFormData(nextFormData);
        setInitialFormData(nextFormData);

        if (username && post.user?.user_name && username !== post.user.user_name) {
          navigate(`/profile/${post.user.user_name}/posts/${id}/edit`, { replace: true });
        }
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to load post for editing';
        setApiError(message);
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
      }
    };

    void fetchEditablePost();

    return () => clearInterval(progressInterval);
  }, [id, navigate, username]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!id || !hasChanges || isSubmitting) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    setSuccessMessage('');
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    try {
      const payload = {
        title: normalizedFormData.title,
        content: normalizedFormData.content,
        exceprt: normalizedFormData.excerpt,
        repo_link: normalizedFormData.repoLink,
      };

      await api.put(`/api/posts/${id}`, payload, {
        withCredentials: true,
      });

      setInitialFormData({
        title: normalizedFormData.title,
        content: normalizedFormData.content,
        repoLink: normalizedFormData.repoLink,
        excerpt: normalizedFormData.excerpt,
      });
      setSuccessMessage('Post updated successfully!');
      setProgress(100);

      setTimeout(() => {
        navigate(`/post/${id}`);
      }, 1200);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update post';
      setApiError(message);
    } finally {
      clearInterval(progressInterval);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AnimatedCircularProgressBar
            value={progress}
            gaugePrimaryColor="var(--color-land)"
            gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
            className="text-white"
          />
        </div>
      </div>
    );
  }

  if (!initialFormData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
        <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-land">Edit Post</h1>
            <button
              type="button"
              onClick={() => navigate(username ? `/profile/${username}` : '/home')}
              className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:border-white hover:text-white transition-all font-mono"
            >
              Back
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg flex items-center gap-3 font-mono">
            <AlertCircle size={20} />
            {apiError || 'Unable to load this post for editing.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-land">Edit Post</h1>
            <p className="mt-1 text-xs font-mono text-gray-500">
              Only title, excerpt, content, and repo link can be updated after publishing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className={`px-4 py-2 rounded-lg font-mono transition-all ${
                showPreview ? 'bg-land text-black' : 'border border-land text-land hover:bg-land/10'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:border-white hover:text-white transition-all font-mono"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-land/10 border border-land text-land p-4 m-6 rounded-lg flex items-center gap-3 font-mono">
          <Check size={20} />
          {successMessage}
        </div>
      )}
      {apiError && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 m-6 rounded-lg flex items-center gap-3 font-mono">
          <AlertCircle size={20} />
          {apiError}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {!showPreview && (
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-land font-mono">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title..."
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono ${
                    errors.title
                      ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                      : 'border-gray-700 focus:border-land focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
                  }`}
                />
                {errors.title && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-mono">
                    <AlertCircle size={16} />
                    {errors.title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-land font-mono">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your post..."
                  rows={2}
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono resize-none ${
                    errors.excerpt
                      ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                      : 'border-gray-700 focus:border-land focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
                  }`}
                />
                {errors.excerpt && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-mono">
                    <AlertCircle size={16} />
                    {errors.excerpt}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-land font-mono">
                  Content (Markdown) *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Update your markdown content..."
                  rows={15}
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono resize-none ${
                    errors.content
                      ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                      : 'border-gray-700 focus:border-land focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
                  }`}
                />
                {errors.content && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-mono">
                    <AlertCircle size={16} />
                    {errors.content}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-land font-mono">
                  GitHub Repo Link *
                </label>
                <input
                  type="url"
                  name="repoLink"
                  value={formData.repoLink}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo-name"
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono ${
                    errors.repoLink
                      ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                      : 'border-gray-700 focus:border-land focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
                  }`}
                />
                {errors.repoLink && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-mono">
                    <AlertCircle size={16} />
                    {errors.repoLink}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || isSubmitting}
                  className={`flex-1 px-8 py-3 font-bold rounded-lg transition-all font-mono ${
                    !hasChanges || isSubmitting
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-land text-black hover:shadow-[0_0_20px_rgba(44,255,5,0.5)]'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/post/${id}`)}
                  className="px-8 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-white hover:text-white transition-all font-mono"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showPreview && (
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h1 className="text-5xl font-bold mb-6 text-land drop-shadow-[0_0_20px_rgba(44,255,5,0.5)]">
                    {formData.title || 'Your Post Title'}
                  </h1>

                  <div className="flex items-center gap-6 text-sm text-gray-400 font-mono mb-8">
                    <span>@{username}</span>
                    <span>Updated draft preview</span>
                  </div>

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
                            <span className="text-land mr-3">{'>'}</span>
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
                      {parsedContent}
                    </ReactMarkdown>
                  </article>
                </div>

                <div className="border-l border-gray-800 pl-8">
                  <div className="sticky top-24 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-land mb-3 font-mono">EXCERPT</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {formData.excerpt || 'Your excerpt will appear here...'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-land mb-3 font-mono">REPO LINK</h3>
                      <p className="text-sm text-gray-300 break-all leading-relaxed">
                        {formData.repoLink || 'Your repository link will appear here...'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-land mb-3 font-mono">SAVE STATE</h3>
                      <span
                        className={`px-3 py-1 text-xs font-mono border rounded ${
                          hasChanges
                            ? 'border-land text-land bg-land/10'
                            : 'border-gray-700 text-gray-400'
                        }`}
                      >
                        {hasChanges ? 'Unsaved changes' : 'No changes yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-land)"
              gaugeSecondaryColor="rgba(255, 255, 255, 0.12)"
              className="text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdatePost;
