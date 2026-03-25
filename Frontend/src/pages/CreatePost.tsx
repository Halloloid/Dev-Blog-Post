import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Upload, AlertCircle, Check, X } from 'lucide-react';
import api from '@/config/api';
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { useNavigate, useParams } from "react-router-dom";


interface FormErrors {
  title?: string;
  content?: string;
  repoLink?: string;
  tags?: string;
  image?: string;
  excerpt?: string;
  status?: string;
}

interface TagOption {
  id: string;
  name: string;
  slug?: string;
}

interface FormData {
  title: string;
  content: string;
  repoLink: string;
  tags: TagOption[];
  excerpt: string;
  status: 'draft' | 'published';
  imageUrl: string;
  imageFile: File | null;
}

function CreatePost() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    repoLink: '',
    tags: [],
    excerpt: '',
    status: 'draft',
    imageUrl: '',
    imageFile: null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(10);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const validateForm = (mode: 'draft' | 'published'): FormErrors => {
    const newErrors: FormErrors = {};

    if (mode === 'published') {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }

      if (!formData.content.trim()) {
        newErrors.content = 'Content is required';
      }

      if (!formData.repoLink.trim()) {
        newErrors.repoLink = 'GitHub repo link is required';
      } else if (!formData.repoLink.startsWith('https://github.com/')) {
        newErrors.repoLink = 'Please enter a valid GitHub URL';
      }

      if (formData.tags.length === 0) {
        newErrors.tags = 'At least one tag is required';
      }

      if (!formData.imageUrl && !formData.imageFile) {
        newErrors.image = 'Featured image is required';
      }

      if (!formData.excerpt.trim()) {
        newErrors.excerpt = 'Excerpt is required';
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const previewcontent = formData.content || '# Start writing your content...\n\nYour markdown preview will appear here.'
  const parsedcontent = previewcontent.replace(/\\n/g, "\n");
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image file' }));
      return;
    }

    setFormData(prev => ({ ...prev, imageFile: file }));

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/api/tags');
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data
          .map((tag: any) => {
            if (typeof tag === 'string') {
              const trimmed = tag.trim();
              if (!trimmed) return null;
              return { id: trimmed, name: trimmed, slug: trimmed } as TagOption;
            }
            if (tag?.id && tag?.name) {
              return { id: tag.id, name: tag.name, slug: tag.slug } as TagOption;
            }
            return null;
          })
          .filter((tag: TagOption | null): tag is TagOption => Boolean(tag));
        setAvailableTags(normalized);
      } catch (error) {
        console.error('Failed to load tags', error);
      }
    };

    fetchTags();
  }, []);

  const handlePublish = async () => {
    const newErrors = validateForm(formData.status);
    if (formData.status === 'draft' || Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      setProgress(10);
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 250);

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("content", formData.content);
      payload.append("repo_link", formData.repoLink);
      payload.append("exceprt", formData.excerpt);
      payload.append("status", formData.status);

      formData.tags.forEach((tag) => {
        payload.append("tags[]", tag.id);
      });

      if (formData.imageFile) {
        payload.append("featured_img", formData.imageFile);
      }

      try {
        await api.post("/api/posts/", payload, {
          withCredentials: true
        });
        setApiError('');
        setSuccessMessage('Post created successfully!');
        setProgress(100);
        setTimeout(() => {
          setSuccessMessage('');
          navigate("/home");
        }, 2000);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Failed to create post";
        setApiError(message);
        console.error("Failed to create post", error);
      } finally {
        clearInterval(progressInterval);
        setIsSubmitting(false);
      }
    } else {
      const firstError = Object.keys(newErrors)[0];
      if (firstError === 'content') {
        document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (firstError === 'tags') {
        tagInputRef.current?.focus();
      }
    }
  };

  const normalizedInput = tagInput.trim();
  const findTagByInput = (input: string) => {
    const lower = input.trim().toLowerCase();
    if (!lower) return null;
    return availableTags.find(
      tag => tag.name.toLowerCase() === lower || tag.slug?.toLowerCase() === lower
    ) || null;
  };

  const suggestions = useMemo(() => {
    if (!normalizedInput) return [];
    const lower = normalizedInput.toLowerCase();
    return availableTags
      .filter(tag => !formData.tags.some(selected => selected.id === tag.id))
      .filter(tag => tag.name.toLowerCase().includes(lower) || tag.slug?.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [availableTags, formData.tags, normalizedInput]);

  const addTag = (tag: TagOption) => {
    if (!tag?.id) return;
    if (formData.tags.some(selected => selected.id === tag.id)) return;
    if (formData.tags.length >= 5) return;

    setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput('');
    setShowSuggestions(false);
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: undefined }));
    }
  };

  const removeTag = (tagToRemove: TagOption) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagToRemove.id)
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-land">Create New Post</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg font-mono transition-all ${showPreview
                ? 'bg-land text-black'
                : 'border border-land text-land hover:bg-land/10'
                }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:border-white hover:text-white transition-all font-mono" onClick={() => navigate("/home")}
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
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono ${errors.title
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
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono resize-none ${errors.excerpt
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

              <div id="content-section" className="space-y-2">
                <label className="block text-sm font-bold text-land font-mono">
                  Content (Markdown) *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your content in markdown... (supports code blocks with ```typescript)"
                  rows={15}
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono resize-none ${errors.content
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
                  Tags (max 5) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    ref={tagInputRef}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const match = findTagByInput(tagInput);
                        if (match) {
                          addTag(match);
                        } else {
                          setErrors(prev => ({ ...prev, tags: 'Please select a tag from suggestions' }));
                        }
                      }
                      if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
                        removeTag(formData.tags[formData.tags.length - 1]);
                      }
                    }}
                    placeholder="Start typing a tag and press Enter"
                    disabled={formData.tags.length >= 5}
                    className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono ${errors.tags
                      ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                      : 'border-gray-700 focus:border-land focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
                      }`}
                  />
                  {showSuggestions && suggestions.length > 0 && formData.tags.length < 5 && (
                    <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-700 bg-[#0d0d0d] shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                      {suggestions.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="w-full text-left px-4 py-2 text-sm font-mono text-gray-300 hover:bg-land/10 hover:text-land transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.tags && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-mono">
                    <AlertCircle size={16} />
                    {errors.tags}
                  </div>
                )}
                <div className="text-xs text-gray-500 font-mono">
                  {formData.tags.length}/5 tags selected
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono border border-land text-land rounded-full shadow-[0_0_10px_rgba(44,255,5,0.2)]"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-land/80 hover:text-land"
                        aria-label={`Remove ${tag.name}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
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
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono ${errors.repoLink
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

              <div className="space-y-2">
                <label className="block text-sm font-bold text-land font-mono">
                  Featured Image *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${errors.image
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-land hover:bg-land/5'
                      }`}
                  >
                    <Upload size={24} className={errors.image ? 'text-red-500' : 'text-land'} />
                    <div className="text-center">
                      <p className={`font-mono font-bold ${errors.image ? 'text-red-500' : 'text-land'}`}>
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500 font-mono">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-4 relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, imageUrl: '', imageFile: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {errors.image && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-mono">
                    <AlertCircle size={16} />
                    {errors.image}
                  </div>
                )}
              </div>


              <div className="space-y-2">
                <label className="block text-sm font-bold text-land font-mono">
                  Status *
                </label>

                <div className="flex items-center gap-6  p-4">

                  <label className="flex items-center gap-2 text-gray-300 font-mono cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={handleInputChange}
                      className="accent-land w-4 h-4"
                    />
                    Draft
                  </label>

                  <label className="flex items-center gap-2 text-gray-300 font-mono cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === "published"}
                      onChange={handleInputChange}
                      className="accent-land w-4 h-4"
                    />
                    Published
                  </label>

                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  className="flex-1 px-8 py-3 bg-land text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(44,255,5,0.5)] transition-all font-mono"
                >
                  {formData.status === 'published' ? 'Publish Post' : 'Save Draft'}
                </button>
                <button

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
                  {imagePreview && (
                    <div className="mb-8">
                      <img
                        src={imagePreview}
                        alt="Featured"
                        className="w-full h-96 object-cover rounded-lg border border-gray-800"
                      />
                    </div>
                  )}

                  <h1 className="text-5xl font-bold mb-6 text-land drop-shadow-[0_0_20px_rgba(44,255,5,0.5)]">
                    {formData.title || 'Your Post Title'}
                  </h1>

                  <div className="flex items-center gap-6 text-sm text-gray-400 font-mono mb-8">
                    <span>{username}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
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
                      {parsedcontent}
                    </ReactMarkdown>
                  </article>
                </div>

                <div className="border-l border-gray-800 pl-8">
                  <div className="sticky top-24 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-land mb-3 font-mono">TAGS</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={tag.id}
                            className={`px-3 py-1 text-xs font-mono border rounded-full ${index % 2 === 0
                              ? 'border-land text-land shadow-[0_0_10px_rgba(44,255,5,0.3)]'
                              : 'border-white text-white'
                              }`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-land mb-3 font-mono">EXCERPT</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {formData.excerpt || 'Your excerpt will appear here...'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-land mb-3 font-mono">STATUS</h3>
                      <span className={`px-3 py-1 text-xs font-mono border rounded ${formData.status === 'published'
                        ? 'border-land text-land bg-land/10'
                        : 'border-gray-700 text-gray-400'
                        }`}>
                        {formData.status === 'published' ? 'Published' : 'Draft'}
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

export default CreatePost;
