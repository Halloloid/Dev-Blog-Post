import { useEffect, useState } from 'react';
import BlogPost from '../components/BlogPost';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_img: string;
  repo_link: string;
  user: { id: string; full_name: string };
  created_at: string;
  view_count: number;
  likes_count: number;
  comments_count: number;
  tags: { id: string; slug: string; name: string }[];
}

function PostView() {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockPost: BlogPostData = {
      id: '9617d0f9-e897-4428-9774-c54728552728',
      title: 'TypeScript Generics Explained',
      content: `# TypeScript Generics

Generics allow you to write reusable code that works with any type.

## Basic Generic Function

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);
const str = identity<string>("hello");
\`\`\`

## Generic Interfaces

\`\`\`typescript
interface Repository<T> {
  getAll(): T[];
  getById(id: string): T | null;
  create(item: T): T;
}

class UserRepository implements Repository<User> {
  getAll(): User[] {
    // implementation
    return [];
  }

  getById(id: string): User | null {
    // implementation
    return null;
  }

  create(item: User): User {
    // implementation
    return item;
  }
}
\`\`\`

## Constraints

\`\`\`typescript
interface HasLength {
  length: number;
}

function loggingIdentity<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}
\`\`\`

## Key Benefits

Generics provide type safety while maintaining code reusability. They allow you to:

- Write functions and classes that work with multiple types
- Catch type errors at compile time rather than runtime
- Improve code readability and maintainability
- Create flexible libraries and frameworks

Try using generics in your next TypeScript project!`,
      excerpt: 'Learn how to use TypeScript Generics to write flexible and reusable code',
      featured_img: 'https://images.pexels.com/photos/1516259/pexels-photo-1516259.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop',
      repo_link: 'https://github.com/john_dev/typescript-generics',
      user: { id: '47a16fea-cd4a-4a19-920c-49b334684f94', full_name: 'John Developer' },
      created_at: '2026-01-31T11:30:00.973Z',
      view_count: 72,
      likes_count: 53,
      comments_count: 0,
      tags: [
        { id: 'aae1d017-d9c5-40f9-aa7a-620aa732c1c8', slug: 'tutorial', name: 'Tutorial' },
        { id: '72d68809-2534-4f4a-9dfc-8f88b3df0bcd', slug: 'typescript', name: 'TypeScript' },
        { id: '21e80ab0-6ce5-4a1e-9cbb-98cbc89f5c11', slug: 'advanced', name: 'Advanced' }
      ]
    };

    setPost(mockPost);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-land font-mono">Loading...</p>
      </div>
    );
  }

  return post ? <BlogPost post={post} /> : null;
}

export default PostView;
