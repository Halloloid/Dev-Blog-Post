import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Upload, AlertCircle, Check, X } from 'lucide-react';
import api from '@/config/api';
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { cn } from '@/lib/utils';


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

interface EditableDraftResponse {
  id: string;
  title: string | null;
  content: string | null;
  repo_link: string | null;
  exceprt: string | null;
  featured_img: string | null;
  status: 'draft' | 'published' | 'archived';
  tags: TagOption[];
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
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [progress, setProgress] = useState(10);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  const isDraftMode = Boolean(draftId);
  const readTime = estimateReadTime(formData.content);
  const strippedContent = stripMarkdown(formData.content);
  const wordCount = strippedContent ? strippedContent.split(/\s+/).filter(Boolean).length : 0;
  const completionCount = [
    Boolean(formData.title.trim()),
    Boolean(formData.excerpt.trim()),
    Boolean(strippedContent),
    formData.tags.length > 0,
    Boolean(formData.repoLink.trim()),
    Boolean(formData.imageUrl || formData.imageFile),
  ].filter(Boolean).length;
  const panelClassName =
    "rounded-[1.75rem] border border-toffeebrown/12 bg-eggshell/84 p-5 shadow-[0_18px_55px_rgba(158,98,64,0.08)] backdrop-blur-sm sm:p-6";
  const fieldClassName =
    "w-full rounded-[1.2rem] border border-toffeebrown/14 bg-eggshell px-4 py-3 text-sm text-toffeebrown outline-none transition-colors placeholder:text-toffeebrown/35 focus:border-rossycopper";
  const fieldLabelClassName =
    "block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/62";
  const errorTextClassName = "flex items-center gap-2 text-sm text-rossycopper";

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

  useEffect(() => {
    if (!draftId) return;

    setIsLoadingDraft(true);
    setApiError('');
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 250);

    const fetchDraft = async () => {
      try {
        const response = await api.get<EditableDraftResponse>(`/api/posts/${draftId}/edit`, {
          withCredentials: true,
        });

        const draft = response.data;

        if (draft.status !== 'draft') {
          navigate(`/profile/${username}/posts/${draftId}/edit`, { replace: true });
          return;
        }

        setFormData({
          title: draft.title ?? '',
          content: draft.content ?? '',
          repoLink: draft.repo_link ?? '',
          tags: draft.tags ?? [],
          excerpt: draft.exceprt ?? '',
          status: 'draft',
          imageUrl: draft.featured_img ?? '',
          imageFile: null,
        });
        setImagePreview(draft.featured_img ?? '');
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to load draft';
        setApiError(message);
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setIsLoadingDraft(false);
      }
    };

    void fetchDraft();

    return () => clearInterval(progressInterval);
  }, [draftId, navigate, username]);

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
        if (isDraftMode && draftId) {
          await api.put(`/api/posts/${draftId}`, payload, {
            withCredentials: true
          });
        } else {
          await api.post("/api/posts/", payload, {
            withCredentials: true
          });
        }
        setApiError('');
        setSuccessMessage(
          isDraftMode
            ? formData.status === 'published'
              ? 'Draft published successfully!'
              : 'Draft updated successfully!'
            : 'Post created successfully!'
        );
        setProgress(100);
        setTimeout(() => {
          setSuccessMessage('');
          if (isDraftMode && draftId) {
            navigate(formData.status === 'published' ? `/post/${draftId}` : `/profile/${username}`);
            return;
          }

          navigate("/home");
        }, 2000);
      } catch (error: any) {
        const message = error?.response?.data?.message || (isDraftMode ? "Failed to update draft" : "Failed to create post");
        setApiError(message);
        console.error(isDraftMode ? "Failed to update draft" : "Failed to create post", error);
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
    <div className="relative min-h-screen overflow-x-hidden bg-eggshell text-toffeebrown">
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-skyreflection/18 blur-3xl" />

      <div className="sticky top-0 z-50 border-b border-toffeebrown/10 bg-eggshell/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/58">
              Writer Studio
            </p>
            <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.5rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">
              {isDraftMode ? 'Continue Draft' : 'Create New Post'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors sm:px-5 sm:text-sm ${showPreview
                ? 'border border-rossycopper bg-rossycopper text-eggshell'
                : 'border border-toffeebrown/14 bg-eggshell text-toffeebrown hover:border-rossycopper/28 hover:bg-lightbronze/18'
                }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-toffeebrown/14 bg-eggshell px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-toffeebrown/72 transition-colors hover:border-toffeebrown hover:text-toffeebrown sm:px-5 sm:text-sm"
              onClick={() => navigate(isDraftMode && username ? `/profile/${username}` : "/home")}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mx-4 mt-6 flex items-center gap-3 rounded-[1.25rem] border border-skyreflection/28 bg-skyreflection/14 p-4 text-toffeebrown sm:mx-6 lg:mx-8">
          <Check size={20} />
          {successMessage}
        </div>
      )}
      {apiError && (
        <div className="mx-4 mt-6 flex items-center gap-3 rounded-[1.25rem] border border-rossycopper/25 bg-rossycopper/10 p-4 text-rossycopper sm:mx-6 lg:mx-8">
          <AlertCircle size={20} />
          {apiError}
        </div>
      )}

      <div className={cn("mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8", showPreview ? "max-w-7xl" : "max-w-[78rem]")}>
        <div className={cn("grid grid-cols-1 gap-8", showPreview ? "xl:grid-cols-3" : "xl:grid-cols-1")}>
          {!showPreview && (
            <div className="xl:col-span-1">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.72fr)] xl:items-start">
                <div className="space-y-6">
                  <div className="rounded-[1.8rem] border border-toffeebrown/12 bg-[linear-gradient(135deg,rgba(222,164,126,0.16),rgba(248,242,220,0.94)_34%,rgba(129,173,200,0.12)_100%)] p-6 shadow-[0_22px_60px_rgba(158,98,64,0.08)] sm:p-7">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/58">
                      Draft Desk
                    </p>
                    <h2 className="mt-3 text-[clamp(1.8rem,3vw,2.6rem)] font-black uppercase tracking-[-0.05em] text-toffeebrown">
                      A focused workspace for writing, shaping, and shipping.
                    </h2>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-[1.2rem] border border-toffeebrown/10 bg-eggshell/82 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Read Time</p>
                        <p className="mt-2 text-2xl font-black text-toffeebrown">{readTime}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-toffeebrown/10 bg-eggshell/82 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Words</p>
                        <p className="mt-2 text-2xl font-black text-toffeebrown">{wordCount}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-toffeebrown/10 bg-eggshell/82 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Tags</p>
                        <p className="mt-2 text-2xl font-black text-toffeebrown">{formData.tags.length}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-toffeebrown/10 bg-eggshell/82 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Ready</p>
                        <p className="mt-2 text-2xl font-black text-toffeebrown">{completionCount}/6</p>
                      </div>
                    </div>
                  </div>

                  <div className={cn("space-y-8", panelClassName)}>
              <div className="space-y-2">
                <label className={fieldLabelClassName}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title..."
                  className={cn(fieldClassName, errors.title && "border-rossycopper")}
                />
                {errors.title && (
                  <div className={errorTextClassName}>
                    <AlertCircle size={16} />
                    {errors.title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClassName}>
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your post..."
                  rows={2}
                  className={cn(fieldClassName, "min-h-28 resize-none leading-7", errors.excerpt && "border-rossycopper")}
                />
                {errors.excerpt && (
                  <div className={errorTextClassName}>
                    <AlertCircle size={16} />
                    {errors.excerpt}
                  </div>
                )}
              </div>

              <div id="content-section" className="space-y-2">
                <label className={fieldLabelClassName}>
                  Content (Markdown) *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your content in markdown... (supports code blocks with ```typescript)"
                  rows={15}
                  className={cn(fieldClassName, "min-h-[22rem] resize-none leading-7", errors.content && "border-rossycopper")}
                />
                {errors.content && (
                  <div className={errorTextClassName}>
                    <AlertCircle size={16} />
                    {errors.content}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClassName}>
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
                    className={cn(fieldClassName, errors.tags && "border-rossycopper")}
                  />
                  {showSuggestions && suggestions.length > 0 && formData.tags.length < 5 && (
                    <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-[1.2rem] border border-toffeebrown/12 bg-eggshell shadow-[0_18px_45px_rgba(158,98,64,0.12)]">
                      {suggestions.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="w-full px-4 py-3 text-left text-sm text-toffeebrown transition-colors hover:bg-lightbronze/16"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.tags && (
                  <div className={errorTextClassName}>
                    <AlertCircle size={16} />
                    {errors.tags}
                  </div>
                )}
                <div className="text-xs text-toffeebrown/52">
                  {formData.tags.length}/5 tags selected
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-2 rounded-full border border-rossycopper/22 bg-rossycopper/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rossycopper"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-rossycopper/80 hover:text-rossycopper"
                        aria-label={`Remove ${tag.name}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClassName}>
                  GitHub Repo Link *
                </label>
                <input
                  type="url"
                  name="repoLink"
                  value={formData.repoLink}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo-name"
                  className={cn(fieldClassName, errors.repoLink && "border-rossycopper")}
                />
                {errors.repoLink && (
                  <div className={errorTextClassName}>
                    <AlertCircle size={16} />
                    {errors.repoLink}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClassName}>
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
                    className={`flex min-h-44 items-center justify-center gap-3 rounded-[1.4rem] border-2 border-dashed p-8 transition-colors ${errors.image
                      ? 'border-rossycopper bg-rossycopper/6'
                      : 'border-toffeebrown/18 bg-eggshell hover:border-rossycopper/28 hover:bg-lightbronze/12'
                      }`}
                  >
                    <Upload size={24} className={errors.image ? 'text-rossycopper' : 'text-toffeebrown'} />
                    <div className="text-center">
                      <p className={`font-semibold uppercase tracking-[0.16em] ${errors.image ? 'text-rossycopper' : 'text-toffeebrown'}`}>
                        Click to upload image
                      </p>
                      <p className="text-xs text-toffeebrown/52">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-4 relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-56 w-full rounded-[1.2rem] border border-toffeebrown/12 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, imageUrl: '', imageFile: null }));
                      }}
                      className="absolute right-3 top-3 rounded-full bg-rossycopper px-3 py-1.5 text-sm font-semibold text-eggshell opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {errors.image && (
                  <div className={errorTextClassName}>
                    <AlertCircle size={16} />
                    {errors.image}
                  </div>
                )}
              </div>


              <div className="space-y-2">
                <label className={fieldLabelClassName}>
                  Status *
                </label>

                <div className="grid grid-cols-1 gap-3 rounded-[1.4rem] border border-toffeebrown/12 bg-lightbronze/10 p-4 sm:grid-cols-2">

                  <label className="flex cursor-pointer items-center gap-3 rounded-[1rem] border border-toffeebrown/12 bg-eggshell px-4 py-3 text-sm font-semibold text-toffeebrown">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={handleInputChange}
                      className="accent-rossycopper h-4 w-4"
                    />
                    Draft
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-[1rem] border border-toffeebrown/12 bg-eggshell px-4 py-3 text-sm font-semibold text-toffeebrown">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === "published"}
                      onChange={handleInputChange}
                      className="accent-rossycopper h-4 w-4"
                    />
                    Published
                  </label>

                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handlePublish}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-rossycopper px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-eggshell transition-colors hover:bg-toffeebrown"
                >
                  {isDraftMode
                    ? formData.status === 'published'
                      ? 'Publish Draft'
                      : 'Update Draft'
                    : formData.status === 'published'
                      ? 'Publish Post'
                      : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(isDraftMode && username ? `/profile/${username}` : "/home")}
                  className="inline-flex items-center justify-center rounded-full border border-toffeebrown/14 bg-eggshell px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-toffeebrown/72 transition-colors hover:border-toffeebrown hover:text-toffeebrown"
                >
                  Cancel
                </button>
              </div>
                  </div>
                </div>

                <div className="space-y-6 xl:sticky xl:top-24">
                  <div className={cn("space-y-5", panelClassName)}>
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/58">
                        Studio Rail
                      </p>
                      <p className="mt-2 text-sm leading-7 text-toffeebrown/68">
                        Keep the post details close while the writing area stays focused.
                      </p>
                    </div>

                    <div className="rounded-[1.35rem] border border-toffeebrown/10 bg-[linear-gradient(135deg,rgba(205,70,49,0.08),rgba(248,242,220,0.95)_72%)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">
                          Post Health
                        </p>
                        <span className="text-sm font-black text-toffeebrown">{completionCount}/6</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-toffeebrown/8">
                        <div
                          className="h-full rounded-full bg-rossycopper transition-all"
                          style={{ width: `${(completionCount / 6) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[1rem] border border-toffeebrown/10 bg-eggshell px-4 py-3">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Title</p>
                        <p className="mt-2 text-base font-bold text-toffeebrown">{formData.title.trim() ? 'Set' : 'Missing'}</p>
                      </div>
                      <div className="rounded-[1rem] border border-toffeebrown/10 bg-eggshell px-4 py-3">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Image</p>
                        <p className="mt-2 text-base font-bold text-toffeebrown">{imagePreview ? 'Added' : 'Missing'}</p>
                      </div>
                      <div className="rounded-[1rem] border border-toffeebrown/10 bg-eggshell px-4 py-3">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Excerpt</p>
                        <p className="mt-2 text-base font-bold text-toffeebrown">{formData.excerpt.trim() ? 'Ready' : 'Missing'}</p>
                      </div>
                      <div className="rounded-[1rem] border border-toffeebrown/10 bg-eggshell px-4 py-3">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Repo</p>
                        <p className="mt-2 text-base font-bold text-toffeebrown">{formData.repoLink.trim() ? 'Linked' : 'Missing'}</p>
                      </div>
                    </div>
                  </div>

                  <div className={cn("space-y-4", panelClassName)}>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/58">
                      Live Snapshot
                    </p>
                    <div className="rounded-[1.25rem] border border-toffeebrown/10 bg-lightbronze/12 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Working Title</p>
                      <p className="mt-3 line-clamp-3 text-lg font-black uppercase leading-tight tracking-[-0.03em] text-toffeebrown">
                        {formData.title || 'Your story title will appear here.'}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-toffeebrown/10 bg-eggshell p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Excerpt</p>
                      <p className="mt-3 text-sm leading-7 text-toffeebrown/72">
                        {formData.excerpt || 'A short editorial summary helps the post feel intentional before the reader opens it.'}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-toffeebrown/10 bg-eggshell p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-toffeebrown/48">Tag Set</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.tags.length > 0 ? (
                          formData.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full border border-rossycopper/20 bg-rossycopper/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-rossycopper"
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm leading-7 text-toffeebrown/58">
                            Add a few tags to define the post.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPreview && (
            <div className="xl:col-span-3">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
                <div className="min-w-0 xl:col-span-2">
                  {imagePreview && (
                    <div className="mb-8 overflow-hidden rounded-[1.9rem] border border-toffeebrown/12 bg-eggshell/90 shadow-[0_22px_60px_rgba(158,98,64,0.09)]">
                      <img
                        src={imagePreview}
                        alt="Featured"
                        className="h-64 w-full object-cover sm:h-80 lg:h-96"
                      />
                    </div>
                  )}

                  <div className="mb-8 rounded-[2rem] border border-toffeebrown/12 bg-[linear-gradient(135deg,rgba(222,164,126,0.2),rgba(248,242,220,0.96)_36%,rgba(129,173,200,0.12)_100%)] px-5 py-6 shadow-[0_24px_70px_rgba(158,98,64,0.08)] sm:px-8 sm:py-8">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-toffeebrown/56">
                      Editorial Preview
                    </p>
                    <h1 className="mt-4 text-[clamp(2.5rem,7vw,4.9rem)] font-black uppercase leading-[0.9] tracking-[-0.06em] text-toffeebrown">
                      {formData.title || 'Your Post Title'}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-toffeebrown/58 sm:text-[0.95rem]">
                      <span className="font-semibold text-toffeebrown/72">{username || 'creator_name'}</span>
                      <span className="hidden h-1.5 w-1.5 rounded-full bg-toffeebrown/24 sm:inline-flex" />
                      <span>{new Date().toLocaleDateString()}</span>
                      <span className="hidden h-1.5 w-1.5 rounded-full bg-toffeebrown/24 sm:inline-flex" />
                      <span>{readTime} min read</span>
                    </div>
                  </div>


                  <article className="rounded-[1.9rem] border border-toffeebrown/12 bg-eggshell/92 px-5 py-6 shadow-[0_24px_70px_rgba(158,98,64,0.1)] sm:px-8 sm:py-8">
                    <div className="mb-6 border-b border-toffeebrown/10 pb-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-toffeebrown/52">Story Preview</p>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-toffeebrown/68">
                        This preview uses the same editorial reading rhythm as the post view.
                      </p>
                    </div>
                    <div className="prose max-w-none prose-headings:text-toffeebrown prose-p:text-toffeebrown/80 prose-strong:text-rossycopper prose-li:text-toffeebrown/76">
                    <ReactMarkdown
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={editorialCodeTheme}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                background: '#0f172a',
                                border: '1px solid rgba(158,98,64,0.18)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                fontSize: '0.94rem',
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="rounded border border-toffeebrown/12 bg-lightbronze/18 px-2 py-1 text-toffeebrown" {...props}>
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children }) => (
                          <h1 className="mb-6 mt-12 text-4xl font-black uppercase tracking-[-0.04em] text-toffeebrown">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-5 mt-10 text-3xl font-black uppercase tracking-[-0.04em] text-rossycopper">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-4 mt-8 text-2xl font-black uppercase tracking-[-0.04em] text-toffeebrown">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-6 leading-8 text-toffeebrown/80">
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
                            <span className="mr-3 text-rossycopper">+</span>
                            <span className="text-toffeebrown/76">{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-rossycopper">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {parsedcontent}
                    </ReactMarkdown>
                    </div>
                  </article>
                </div>

                <div className="min-w-0 xl:border-l xl:border-toffeebrown/10 xl:pl-8">
                  <div className="space-y-5 xl:sticky xl:top-6">
                    <div className="rounded-[1.6rem] border border-toffeebrown/12 bg-eggshell/84 p-5 shadow-[0_18px_50px_rgba(158,98,64,0.08)]">
                      <h3 className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/56">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.length > 0 ? (
                          formData.tags.map((tag, index) => (
                            <span
                              key={tag.id}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
                                index % 3 === 0
                                  ? "border-rossycopper/22 bg-rossycopper/10 text-rossycopper"
                                  : index % 3 === 1
                                    ? "border-skyreflection/26 bg-skyreflection/14 text-toffeebrown"
                                    : "border-lightbronze/28 bg-lightbronze/16 text-toffeebrown",
                              )}
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm leading-7 text-toffeebrown/56">
                            Add a few tags and they will appear here.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-toffeebrown/12 bg-eggshell/84 p-5 shadow-[0_18px_50px_rgba(158,98,64,0.08)]">
                      <h3 className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/56">Excerpt</h3>
                      <p className="text-sm leading-7 text-toffeebrown/76">
                        {formData.excerpt || 'Your excerpt will appear here...'}
                      </p>
                    </div>

                    <div className="rounded-[1.6rem] border border-toffeebrown/12 bg-eggshell/84 p-5 shadow-[0_18px_50px_rgba(158,98,64,0.08)]">
                      <h3 className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/56">Status</h3>
                      <span className={cn(
                        "inline-flex rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em]",
                        formData.status === 'published'
                          ? 'border-skyreflection/28 bg-skyreflection/14 text-toffeebrown'
                          : 'border-lightbronze/28 bg-lightbronze/16 text-toffeebrown/72',
                      )}>
                        {formData.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="rounded-[1.6rem] border border-toffeebrown/12 bg-[linear-gradient(135deg,rgba(205,70,49,0.08),rgba(248,242,220,0.95)_70%)] p-5 shadow-[0_18px_50px_rgba(158,98,64,0.08)]">
                      <h3 className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-toffeebrown/56">Repository</h3>
                      <p className="break-all text-sm leading-7 text-toffeebrown/76">
                        {formData.repoLink || 'Add a GitHub repository link to complete the story metadata.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {(isSubmitting || isLoadingDraft) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-eggshell/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={progress}
              gaugePrimaryColor="var(--color-rossycopper)"
              gaugeSecondaryColor="rgba(158, 98, 64, 0.12)"
              className="text-toffeebrown"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePost;


