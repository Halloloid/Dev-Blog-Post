import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Upload, AlertCircle, Check } from 'lucide-react';


interface FormErrors {
  title?: string;
  content?: string;
  repoLink?: string;
  tags?: string;
  image?: string;
  excerpt?: string;
  status?: string;
}

interface FormData {
  title: string;
  content: string;
  repoLink: string;
  tags: string;
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
    tags: '',
    excerpt: '',
    status: 'draft',
    imageUrl: '',
    imageFile: null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    if (!formData.tags.trim()) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!formData.imageUrl && !formData.imageFile) {
      newErrors.image = 'Featured image is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const previewcontent = formData.content || '# Start writing your content...\n\nYour markdown preview will appear here.'
  console.log(previewcontent)
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

  const handlePublish = () => {
    if (validateForm()) {
      setSuccessMessage('Post created successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError === 'content') {
        document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const parseTags = (tagString: string): string[] => {
    return tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2CFF05]">Create New Post</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg font-mono transition-all ${showPreview
                  ? 'bg-[#2CFF05] text-black'
                  : 'border border-[#2CFF05] text-[#2CFF05] hover:bg-[#2CFF05]/10'
                }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:border-white hover:text-white transition-all font-mono"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-[#2CFF05]/10 border border-[#2CFF05] text-[#2CFF05] p-4 m-6 rounded-lg flex items-center gap-3 font-mono">
          <Check size={20} />
          {successMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {!showPreview && (
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#2CFF05] font-mono">
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
                      : 'border-gray-700 focus:border-[#2CFF05] focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
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
                <label className="block text-sm font-bold text-[#2CFF05] font-mono">
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
                      : 'border-gray-700 focus:border-[#2CFF05] focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
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
                <label className="block text-sm font-bold text-[#2CFF05] font-mono">
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
                      : 'border-gray-700 focus:border-[#2CFF05] focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
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
                <label className="block text-sm font-bold text-[#2CFF05] font-mono">
                  Tags (comma-separated) *
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="TypeScript, Node.js, API, Tutorial"
                  className={`w-full bg-[#0d0d0d] border rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none transition-all font-mono ${errors.tags
                      ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                      : 'border-gray-700 focus:border-[#2CFF05] focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
                    }`}
                />
                {errors.tags && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-mono">
                    <AlertCircle size={16} />
                    {errors.tags}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {parseTags(formData.tags).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-mono border border-[#2CFF05] text-[#2CFF05] rounded-full shadow-[0_0_10px_rgba(44,255,5,0.2)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#2CFF05] font-mono">
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
                      : 'border-gray-700 focus:border-[#2CFF05] focus:shadow-[0_0_10px_rgba(44,255,5,0.2)]'
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
                <label className="block text-sm font-bold text-[#2CFF05] font-mono">
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
                        : 'border-[#2CFF05] hover:bg-[#2CFF05]/5'
                      }`}
                  >
                    <Upload size={24} className={errors.image ? 'text-red-500' : 'text-[#2CFF05]'} />
                    <div className="text-center">
                      <p className={`font-mono font-bold ${errors.image ? 'text-red-500' : 'text-[#2CFF05]'}`}>
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
                <label className="block text-sm font-bold text-[#2CFF05] font-mono">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg p-4 text-gray-300 focus:outline-none focus:border-[#2CFF05] transition-all font-mono"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  className="flex-1 px-8 py-3 bg-[#2CFF05] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(44,255,5,0.5)] transition-all font-mono"
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

                  <h1 className="text-5xl font-bold mb-6 text-[#2CFF05] drop-shadow-[0_0_20px_rgba(44,255,5,0.5)]">
                    {formData.title || 'Your Post Title'}
                  </h1>

                  <div className="flex items-center gap-6 text-sm text-gray-400 font-mono mb-8">
                    <span>John Developer</span>
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
                      <h3 className="text-sm font-bold text-[#2CFF05] mb-3 font-mono">TAGS</h3>
                      <div className="flex flex-wrap gap-2">
                        {parseTags(formData.tags).map((tag, index) => (
                          <span
                            key={tag}
                            className={`px-3 py-1 text-xs font-mono border rounded-full ${index % 2 === 0
                                ? 'border-[#2CFF05] text-[#2CFF05] shadow-[0_0_10px_rgba(44,255,5,0.3)]'
                                : 'border-white text-white'
                              }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#2CFF05] mb-3 font-mono">EXCERPT</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {formData.excerpt || 'Your excerpt will appear here...'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#2CFF05] mb-3 font-mono">STATUS</h3>
                      <span className={`px-3 py-1 text-xs font-mono border rounded ${formData.status === 'published'
                          ? 'border-[#2CFF05] text-[#2CFF05] bg-[#2CFF05]/10'
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
    </div>
  );
}

export default CreatePost;
