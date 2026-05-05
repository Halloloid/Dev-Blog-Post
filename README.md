

# Backend File Structure
```
Backend
├── package.json
├── package-lock.json
├── prisma
│   ├── migrations
│   │   ├── 20260131112748_all_tables
│   │   │   └── migration.sql
│   │   ├── 20260314075134_allow_draft_nullable_fields
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
├── scripts
│   └── setupQstash.ts
├── src
│   ├── config
│   │   ├── cloudinary.ts
│   │   ├── db.ts
│   │   └── redis.ts
│   ├── index.ts
│   ├── jobs
│   │   └── syncViews.ts
│   ├── middlewares
│   │   ├── auth.middleware.ts
│   │   ├── qstash.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── upload.middleware.ts
│   ├── module
│   │   ├── authentication
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   ├── comments
│   │   │   ├── comments.controller.ts
│   │   │   └── comments.routes.ts
│   │   ├── followers
│   │   │   ├── followers.controller.ts
│   │   │   └── followers.routes.ts
│   │   ├── likes
│   │   │   ├── like.lua
│   │   │   ├── likes.controller.ts
│   │   │   ├── like.service.ts
│   │   │   ├── likes.routes.ts
│   │   │   └── unlike.lua
│   │   ├── post
│   │   │   ├── post.controller.ts
│   │   │   ├── post.routes.ts
│   │   │   ├── view.lua
│   │   │   └── view.service.ts
│   │   ├── replies
│   │   │   ├── replies.controller.ts
│   │   │   └── replies.routes.ts
│   │   ├── tags
│   │   │   ├── tags.controller.ts
│   │   │   └── tags.routes.ts
│   │   └── users
│   │       ├── user.repository.ts
│   │       └── users.routes.ts
│   ├── types
│   │   └── express.d.ts
│   └── workers
│       └── likes.worker.ts
└── tsconfig.json

21 directories, 42 files
```



# Frontend File Structure
```
Frontend
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── public
│   └── vite.svg
├── README.md
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── assets
│   │   └── userbg.png
│   ├── components
│   │   ├── 3dReviews.tsx
│   │   ├── animate-ui
│   │   │   ├── components
│   │   │   │   ├── backgrounds
│   │   │   │   │   └── stars.tsx
│   │   │   │   ├── buttons
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── flip.tsx
│   │   │   │   │   └── liquid.tsx
│   │   │   │   ├── community
│   │   │   │   └── radix
│   │   │   │       └── hover-card.tsx
│   │   │   └── primitives
│   │   │       ├── animate
│   │   │       │   └── slot.tsx
│   │   │       ├── buttons
│   │   │       │   ├── button.tsx
│   │   │       │   ├── flip.tsx
│   │   │       │   └── liquid.tsx
│   │   │       ├── radix
│   │   │       │   └── hover-card.tsx
│   │   │       └── texts
│   │   ├── BlogPost.tsx
│   │   ├── Card.tsx
│   │   ├── FollowButton.tsx
│   │   ├── hoverButton.tsx
│   │   ├── Pagination.tsx
│   │   ├── PostCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── ui
│   │       ├── animated-circular-progress-bar.tsx
│   │       ├── button.tsx
│   │       ├── highlighter.tsx
│   │       ├── hyper-text.tsx
│   │       ├── marquee.tsx
│   │       ├── meteors.tsx
│   │       ├── morphing-text.tsx
│   │       ├── pixel-image.tsx
│   │       ├── rainbow-button.tsx
│   │       ├── ripple-button.tsx
│   │       ├── shimmer-button.tsx
│   │       ├── shine-border.tsx
│   │       ├── shiny-button.tsx
│   │       ├── skiper-ui
│   │       │   ├── skiper28.tsx
│   │       │   └── skiper58.tsx
│   │       └── toast.tsx
│   ├── config
│   │   └── api.ts
│   ├── hooks
│   │   └── use-controlled-state.tsx
│   ├── index.css
│   ├── lib
│   │   ├── get-strict-context.tsx
│   │   └── utils.ts
│   ├── main.tsx
│   └── pages
│       ├── CreatePost.tsx
│       ├── Followers.tsx
│       ├── Followings.tsx
│       ├── Home.tsx
│       ├── Landing.tsx
│       ├── PostView.tsx
│       └── UserProfile.tsx
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

22 directories, 61 files
```
