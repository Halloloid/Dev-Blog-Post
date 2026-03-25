import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";

config();
const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({adapter});

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.postLike.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "john@example.com",
      full_name: "John Developer",
      user_name: "john_dev",
      avatar_url:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=john_dev",
      bio: "Full Stack Developer | TypeScript Enthusiast",
      phone: "+1234567890",
      total_posts: 0,
      total_followers: 0,
      total_following: 0,
      total_likes_received: 0,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "jane@example.com",
      full_name: "Jane Smith",
      user_name: "jane_dev",
      avatar_url:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=jane_dev",
      bio: "Backend Engineer | PostgreSQL Expert",
      phone: "+0987654321",
      total_posts: 0,
      total_followers: 0,
      total_following: 0,
      total_likes_received: 0,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "mike@example.com",
      full_name: "Mike Johnson",
      user_name: "mike_dev",
      avatar_url:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=mike_dev",
      bio: "React Specialist | UI/UX Designer",
      phone: "+1122334455",
      total_posts: 0,
      total_followers: 0,
      total_following: 0,
      total_likes_received: 0,
    },
  });

  console.log("✅ Users created");

  // Create tags
  const tags = await Promise.all(
    [
      { name: "TypeScript", slug: "typescript" },
      { name: "React", slug: "react" },
      { name: "Node.js", slug: "nodejs" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "Backend", slug: "backend" },
      { name: "Frontend", slug: "frontend" },
      { name: "Tutorial", slug: "tutorial" },
      { name: "Advanced", slug: "advanced" },
      { name: "Beginner", slug: "beginner" },
      { name: "Database", slug: "database" },
    ].map((tag) =>
      prisma.tag.create({
        data: {
          id: uuidv4(),
          name: tag.name,
          slug: tag.slug,
        },
      })
    )
  );

  console.log("✅ Tags created");

  // Create posts
  const posts = [
    {
      title: "Getting Started with TypeScript in 2024",
      slug: "getting-started-typescript-2024",
      content: `# Getting Started with TypeScript

TypeScript is a powerful superset of JavaScript that adds static typing and other advanced features to the language.

## Why TypeScript?

1. **Type Safety**: Catch errors at compile time, not runtime
2. **Better Tooling**: IDEs can provide better autocomplete and refactoring
3. **Self-Documenting Code**: Types serve as inline documentation
4. **Easier Refactoring**: Change types and find all affected code

## Installation

\`\`\`bash
npm install -g typescript
tsc --version
\`\`\`

## Your First TypeScript Program

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

console.log(greetUser(user));
\`\`\`

## Key Takeaways

- TypeScript adds type safety to JavaScript
- It compiles to regular JavaScript
- Start small and gradually migrate your codebase
- Use strict mode for better type checking`,
      excerpt:
        "Learn the basics of TypeScript and why you should use it in your next project",
      featured_img:
        "https://images.unsplash.com/photo-1516259651985-8a1e26b4fe65?w=800",
      repo_link: "https://github.com/john_dev/typescript-guide",
      status: "published" as const,
      created_by: user1.id,
      tags: [tags[0], tags[8], tags[6]], // TypeScript, Beginner, Tutorial
    },
    {
      title: "Advanced React Patterns for State Management",
      slug: "advanced-react-patterns-state-management",
      content: `# Advanced React Patterns

Managing state in large React applications can be challenging. This guide covers advanced patterns.

## Context API vs Redux

### Context API
- Built-in to React
- Good for simple state
- No extra dependencies

### Redux
- Predictable state management
- Great for complex apps
- Larger boilerplate

## Implementing Custom Hooks

\`\`\`typescript
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  
  return { count, increment, decrement };
}
\`\`\`

## Best Practices

1. Keep state as close to where it's used
2. Use custom hooks to extract logic
3. Memoize expensive computations
4. Use TypeScript for type safety`,
      excerpt:
        "Explore advanced patterns and best practices for managing state in React applications",
      featured_img:
        "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
      repo_link: "https://github.com/john_dev/react-patterns",
      status: "published" as const,
      created_by: user1.id,
      tags: [tags[1], tags[7], tags[5]], // React, Advanced, Frontend
    },
    {
      title: "Building REST APIs with Node.js and Express",
      slug: "building-rest-apis-nodejs-express",
      content: `# Building REST APIs with Node.js

Learn how to build scalable and maintainable REST APIs using Node.js and Express.

## Setting Up Express

\`\`\`typescript
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## API Design Best Practices

1. Use meaningful URLs
2. Use proper HTTP methods (GET, POST, PUT, DELETE)
3. Return appropriate status codes
4. Version your API (/api/v1/)
5. Implement proper error handling
6. Use middleware for common tasks

## Error Handling

\`\`\`typescript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!' 
  });
});
\`\`\``,
      excerpt:
        "A comprehensive guide to building production-ready REST APIs with Node.js and Express",
      featured_img:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      repo_link: "https://github.com/jane_dev/nodejs-rest-api",
      status: "published" as const,
      created_by: user2.id,
      tags: [tags[2], tags[4], tags[6]], // Node.js, Backend, Tutorial
    },
    {
      title: "PostgreSQL Query Optimization Techniques",
      slug: "postgresql-query-optimization",
      content: `# Optimizing PostgreSQL Queries

Learn techniques to make your PostgreSQL queries faster and more efficient.

## Indexing

Create indexes on frequently queried columns:

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author_id ON posts(author_id);
\`\`\`

## Query Analysis

Use EXPLAIN to analyze query performance:

\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM posts WHERE author_id = '123';
\`\`\`

## Avoiding N+1 Problems

Always fetch related data in a single query:

\`\`\`sql
-- Bad: N+1 queries
SELECT * FROM posts;
-- Then for each post, query SELECT * FROM users WHERE id = ...

-- Good: Single query with JOIN
SELECT p.*, u.* FROM posts p
JOIN users u ON p.author_id = u.id;
\`\`\`

## Performance Tips

1. Always use indexes on foreign keys
2. Avoid SELECT *
3. Use appropriate data types
4. Denormalize when necessary
5. Monitor slow queries`,
      excerpt:
        "Master PostgreSQL performance optimization to build faster applications",
      featured_img:
        "https://images.unsplash.com/photo-1590080876460-62bfb0d810d6?w=800",
      repo_link: "https://github.com/jane_dev/postgres-optimization",
      status: "published" as const,
      created_by: user2.id,
      tags: [tags[3], tags[9], tags[7]], // PostgreSQL, Database, Advanced
    },
    {
      title: "React Hooks Deep Dive",
      slug: "react-hooks-deep-dive",
      content: `# Understanding React Hooks

React Hooks revolutionized how we write React components. Let's dive deep.

## useState Hook

\`\`\`typescript
const [count, setCount] = useState(0);

const increment = () => setCount(count + 1);
\`\`\`

## useEffect Hook

\`\`\`typescript
useEffect(() => {
  // This runs after every render
  console.log('Component rendered');
  
  return () => {
    // Cleanup function
  };
}, [dependencies]);
\`\`\`

## Custom Hooks

\`\`\`typescript
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}
\`\`\`

## Rules of Hooks

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Use the ESLint plugin to enforce these rules`,
      excerpt: "Master React Hooks and learn how to write better React code",
      featured_img:
        "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
      repo_link: "https://github.com/mike_dev/react-hooks-guide",
      status: "published" as const,
      created_by: user3.id,
      tags: [tags[1], tags[6], tags[5]], // React, Tutorial, Frontend
    },
    {
      title: "TypeScript Generics Explained",
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
\`\`\``,
      excerpt:
        "Learn how to use TypeScript Generics to write flexible and reusable code",
      featured_img:
        "https://images.unsplash.com/photo-1516259651985-8a1e26b4fe65?w=800",
      repo_link: "https://github.com/john_dev/typescript-generics",
      status: "published" as const,
      created_by: user1.id,
      tags: [tags[0], tags[7], tags[6]], // TypeScript, Advanced, Tutorial
    },
  ];

  const createdPosts = await Promise.all(
    posts.map((post) =>
      prisma.post.create({
        data: {
          id: uuidv4(),
          title: post.title,
          content: post.content,
          exceprt: post.excerpt,
          featured_img: post.featured_img,
          repo_link: post.repo_link,
          status: post.status,
          created_by: post.created_by,
          view_count: Math.floor(Math.random() * 500),
          likes_count: Math.floor(Math.random() * 100),
          comments_count: Math.floor(Math.random() * 30),
          updated_at: new Date(),
        },
      })
    )
  );

  console.log("✅ Posts created");

  // Link posts to tags
  for (let i = 0; i < createdPosts.length; i++) {
    const post = createdPosts[i];
    const postTags = posts[i].tags;

    await Promise.all(
      postTags.map((tag) =>
        prisma.postTag.create({
          data: {
            post_id: post.id,
            tag_id: tag.id,
          },
        })
      )
    );
  }

  console.log("✅ Post-Tag relations created");

  // Create followers
  await prisma.follower.create({
    data: {
      id: uuidv4(),
      follower_id: user2.id,
      following_id: user1.id,
    },
  });

  await prisma.follower.create({
    data: {
      id: uuidv4(),
      follower_id: user3.id,
      following_id: user1.id,
    },
  });

  await prisma.follower.create({
    data: {
      id: uuidv4(),
      follower_id: user1.id,
      following_id: user2.id,
    },
  });

  console.log("✅ Followers created");


await prisma.postLike.createMany({
  data: [
    {
      id: uuidv4(),
      post_id: createdPosts[0].id,
      user_id: user2.id,
    },
    {
      id: uuidv4(),
      post_id: createdPosts[0].id,
      user_id: user3.id,
    },
  ],
  skipDuplicates: true,
});


  console.log("✅ Post likes created");

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      id: uuidv4(),
      content: "Great post! Really helped me understand TypeScript better.",
      post_id: createdPosts[0].id,
      user_id: user2.id,
    },
  });

  await prisma.comment.create({
    data: {
      id: uuidv4(),
      content: "Thanks for sharing! This is exactly what I needed.",
      post_id: createdPosts[0].id,
      user_id: user3.id,
    },
  });

  await prisma.comment.create({
    data: {
      id: uuidv4(),
      content:
        "Could you explain generics more in depth? I found this section confusing.",
      post_id: createdPosts[0].id,
      user_id: user2.id,
      parent_comment_id: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      id: uuidv4(),
      content: "Awesome guide on API design! Will definitely use this.",
      post_id: createdPosts[2].id,
      user_id: user3.id,
    },
  });

  console.log("✅ Comments created");

  // Update user stats
  await prisma.user.update({
    where: { id: user1.id },
    data: {
      total_posts: 3,
      total_followers: 2,
      total_following: 1,
      total_likes_received: 5,
    },
  });

  await prisma.user.update({
    where: { id: user2.id },
    data: {
      total_posts: 2,
      total_followers: 1,
      total_following: 1,
      total_likes_received: 3,
    },
  });

  await prisma.user.update({
    where: { id: user3.id },
    data: {
      total_posts: 1,
      total_followers: 0,
      total_following: 1,
      total_likes_received: 2,
    },
  });

  console.log("✅ User stats updated");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });