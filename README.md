# Peerplex: Students Forum

A comprehensive student communication and community platform designed for academic institutions. Peerplex enables students to connect, collaborate, share knowledge, and support each other through discussions, polls, reviews, and ratings.

## Table of Contents

- [Purpose & Overview](#purpose--overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Local Installation](#local-installation)
- [Project Functionality](#project-functionality)
- [Security Considerations](#security-considerations)

## Purpose & Overview

Peerplex is a multi-featured forum with following purpose:

- **Academic Discussions**: Organized channels for coursework-related topics
- **Peer Collaboration**: Connect with other students for project work and study groups
- **Knowledge Sharing**: Create and discuss posts, polls, and participate in threaded conversations
- **Community Recognition**: Rate professors and peers based on their contributions and qualities

The platform operates on role-based access (unverified user, verified student) with domain-based verification through institutional email addresses.

## Tech Stack

### Frontend & Framework

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **TailwindCSS 4** - Utility-first styling
- **Shadcn/UI** - Component library built on Radix UI

### Backend & Database

- **Supabase** - Authentication, PostgreSQL database hosting, and real-time features
- **Drizzle ORM** - Type-safe database access
- **PostgreSQL** - Primary relational database
- **Upstash Redis** - Rate limiting and distributed caching

### Forms & Validation

- **React Hook Form 7.63.0** - Efficient form state management
- **Zod 4.1.11** - TypeScript-first schema validation

### Additional Libraries

- **DOMPurify 3.3.1** - Input sanitization
- **Vercel Speed Insights** - Performance monitoring

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Husky & Lint-Staged** - Git hooks for code quality
- **Turbopack** - Next.js bundler for faster builds

## Features

### Content Management

- **Posts** - Create text posts with optional anonymous mode
- **Polls** - Create polls with multiple options and voting
- **Comments** - Hierarchical comment system with nested replies

### Engagement

- **Voting System** - Upvote/downvote posts and comments
- **User Following** - Follow other users to track their activity
- **Notifications** - Real-time alerts for post reactions, comments, and reviews

### Channels & Organization

- **Multiple Channel Types** - General, academic, social, announcements, and local channels
- **Faculty & Specialty Organization** - Channels organized by educational structure
- **Channel Discovery** - Browse and search available channels

### User Recognition & Ratings

- **Leaderboards** - User and channel rankings based on engagement
- **Professor Reviews** - Rate professors on teaching quality, communication, and helpfulness
- **Student Ratings** - Peer-to-peer ratings in academic help, collaboration, leadership, and social categories

### User Management

- **User Profiles** - Complete profile customization with avatar and bio
- **Account Settings** - Manage password, email, theme preferences
- **Email Verification** - Domain-based verification for institutional email addresses
- **Multi-Factor Authentication (MFA)** - Enhanced security with additional authentication factors

### Search & Discovery

- **Search Functionality** - Find posts and content with pagination
- **Channel Browsing** - Explore channels by category or search

## Local Installation

### Prerequisites

- **Node.js** 22+ and npm/yarn
- **Credentials for .env file**

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd practica-2025-students-forum
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory with the following:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_anon_key

   # Database
   DATABASE_URL=postgresql_connection_string

   # Upstash Redis (for rate limiting)
   UPSTASH_REDIS_REST_URL=upstash_url
   UPSTASH_REDIS_REST_TOKEN=upstash_token
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint code quality checks
- `npm test` - Run unit tests

## Project Functionality

### Architecture Overview

```
src/
├── app/                 # Next.js App Router (Pages & Layouts)
├── features/            # Feature modules (20+ features)
├── components/          # Reusable UI components
├── lib/                 # Core utilities (rate limiting, caching, security)
├── utils/               # Helper functions (auth, database, search)
├── db/                  # Database schema and client
└── test-utils/          # Testing utilities
```

### Core Functionality

**Authentication & Authorization**

- Supabase-based authentication with OAuth support
- Session management with cookies
- MFA enrollment and verification

**Content System**

- RESTful API endpoints for CRUD operations
- Support for posts, polls, comments, and reactions
- Pagination and filtering capabilities
- Search with full-text search support

**Social Features**

- Comment threading with parent-child relationships
- User following and follower counts
- Reaction system (upvote/downvote)
- User rating system for peer feedback

**Performance**

- Redis caching layer via Upstash
- Optimized database queries with Drizzle ORM
- Next.js built-in image optimization
- Turbopack for fast builds and hot reload

## Security Considerations

### 1. **Input Sanitization**

- **HTML Sanitization**: DOMPurify removes potentially malicious HTML and scripts
- **Search Query Sanitization**: Prevents SQL injection in search operations
- **UUID Validation**: All IDs are validated before database queries
- Applied to all user inputs including posts, comments, and search queries

### 2. **Rate Limiting**

Upstash Redis-backed distributed rate limiting prevents abuse:

- **Search**: 10 requests/minute
- **Login**: 6 requests/minute
- **Registration**: 4 requests/minute
- **Post Creation**: 2 requests/minute
- **Comments**: 10 requests/minute
- **Password Reset**: 1 request/minute
- **MFA Verification**: 5 attempts/minute

General rate limiter of 300 requests/minute configured in Vercel

### 3. **Authentication & Authorization**

- **Supabase Auth**: Secure authentication with automatic session refresh
- **Middleware Protection**: Routes require valid authentication via `middleware.ts`
- **Cookie Security**: Secure, HTTP-only cookies for session management
- **Email Verification**: Domain-based institutional email verification (\*utm.md)
- **MFA Support**: Additional authentication factor enrollment, verification and management

### 4. **HTTP Security Headers**

Configured in `next.config.ts`:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME-type sniffing
- `Strict-Transport-Security (HSTS)` - Enforces HTTPS
- `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer information
- `Permissions-Policy` - Restrictive by default, grants limited API access
- `X-XSS-Protection` - Browser XSS protection fallback

### 5. **Database Security**

- **ORM-based Queries**: Drizzle ORM prevents SQL injection through parameterized queries
- **Environment Variables**: Sensitive credentials stored in `.env.local` (never committed)

### 6. **Code Quality & Integrity**

- **ESLint**: Enforces code quality standards to prevent common vulnerabilities
- **Git Hooks**: Husky pre-commit hooks run linting and tests
- **Type Safety**: TypeScript prevents runtime type-related vulnerabilities
- **Dependency Management**: Regular updates of libraries on demand. No autopaching of libraries

### 7. **Best Practices**

- **No Secrets in Code**: All sensitive information stored in environment variables
- **CORS Protection**: API endpoints validate request origins
- **Error Handling**: Generic error messages prevent information leakage
- **Session Timeout**: Automatic session refresh and timeout handling
- **Principle of Least Privilege**: Users have minimal necessary permissions

### 8. **Monitoring & Compliance**

- **Vercel Speed Insights**: Performance monitoring for security regressions
- **CSP Violation Reporting**: Unauthorized scripts are logged and reported
- **Audit Trail**: User actions are logged for security investigations

### Environment-Specific Notes

**Development**

- Rate limiting can be disabled for local testing
- HTTPS not enforced (uses HTTP)

**Production**

- All rate limiting is active
- HTTPS is enforced, HSTS enabled
- Secure cookies with SameSite attribute

## Getting Help

For issues or questions:

1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Include environment details and reproduction steps
