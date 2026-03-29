# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Development server on port 4200
npm run build    # Production build
npm start        # Production server on port 4200
npm run lint     # ESLint
```

No test framework is configured.

## Architecture Overview

**AutoLaunch** is a social media management SaaS (frontend-only, with a mock API layer for development). Built on Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and SCSS Modules.

### Route Structure

```
/                          → Landing page (public)
/auth/login                → Login (any email/password works in mock mode)
/auth/register             → Register
/launches                  → Post scheduler (calendar + list view)
/analytics                 → Performance metrics
/media                     → Media library
/agents                    → AI content generation
/plugs                     → Plugin management
/third-party               → Social platform connections
/settings                  → User & account settings
/billing                   → Subscription management
```

Middleware in `src/proxy.ts` protects all routes except `/`, `/auth/login`, and `/auth/register`. Auth is detected via cookies: `auth-token` (mock), `authjs.session-token` (NextAuth v5), or `next-auth.session-token` (NextAuth v4 fallback).

### Provider Stack (outermost → innermost)

```
RootLayout
  └── VariableProvider       (env config, OAuth keys)
      └── LayoutProvider     (customFetch + mock API interceptor)
          └── SessionProvider (NextAuth)
              └── UserProvider (user, org, subscription — protected routes only)
```

### Mock API Pattern

`LayoutContext` intercepts all `fetch()` calls and returns mock responses when `useMock=true` (default). Intercepted endpoints:
- `POST /auth/login` → `mockAuth.login()`
- `POST /auth/register` → `mockAuth.register()`
- `GET /auth/me` → `mockAuth.me()`
- `GET/POST /posts` → `mockPosts.list()` / `mockPosts.create()`

Mock state lives in memory (resets on server restart). Any email/password works.

### Server-Side API Routes

- `POST /api/caption-generator` — AI captions via Gemini 2.0 Flash (falls back to Ollama Llama 3.2); supports multiple Gemini keys with round-robin rotation
- `POST /api/linkedin-post` — Publishes UGC posts to LinkedIn with optional image upload
- `POST /api/prompt-enhancer` — Enhances prompts for AI generation
- `/api/auth/[...nextauth]` — NextAuth handlers (Google, Twitter, LinkedIn, Facebook)

### Styling System

- **Dark mode by default**; `[data-theme='light']` activates light mode
- CSS custom properties defined in `src/app/colors.scss` (55+ variables like `--new-bgColor`, `--new-btn-primary`, `--color-primary`, etc.)
- Global resets and shared utilities in `src/app/global.scss`
- Per-component styles use SCSS Modules (`*.module.scss`)
- Font: **Plus Jakarta Sans** (weights 500, 600, 700) via `next/font/google`
- Import alias: `@/*` → `./src/*`

### Key Contexts & Hooks

| Context/Hook | Purpose |
|---|---|
| `useVariables()` | Env config: backend URL, OAuth keys, feature flags |
| `useLayout()` | `fetch()` wrapper and `apiUrl()` builder |
| `useUser()` | Current user, org, subscription, `hasPermission()` |
| `usePosts()` | In-memory posts store |
| `useAuth()` | Auth status, user, organization |
| `useLinkedInPost()` | LinkedIn image + text post |
| `useToast()` | Toast notifications |

### Permission Roles

`owner > admin > member > viewer` — checked via `hasPermission(permission)` from `useUser()`. Permissions include: `posts.create/edit/delete`, `analytics.view`, `settings.edit`, `billing.manage`, `team.manage`.

## Environment Variables

```
NEXT_PUBLIC_BACKEND_URL     # Backend API base URL
FRONTEND_URL                # For OAuth redirects
AUTH_SECRET                 # NextAuth secret
AUTH_GOOGLE_ID/SECRET
AUTH_TWITTER_ID/SECRET
AUTH_LINKEDIN_ID/SECRET
AUTH_FACEBOOK_ID/SECRET
GEMINI_API_KEY_1/2/3        # Round-robin Gemini keys
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_POSTHOG_KEY/HOST
STRIPE_PUBLISHABLE_KEY
```

## Build & Deploy

Hosted on **Netlify** (`netlify.toml`). Uses `@netlify/plugin-nextjs`. Turbopack is enabled in `next.config.ts` — no custom webpack CSS loaders needed.
