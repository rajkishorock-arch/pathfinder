# Pathfinder — Personalized Learning & Career Roadmap Platform

Pathfinder is a web application foundation designed to help students identify career goals, analyze skill gaps, and follow structured daily milestones toward job readiness.

---

## CURRENT STATUS

- **Phase 1: Foundation & UI Design System** — Completed
- **Phase 2: Database & Authentication Architecture** — Completed
- **Real Skill Assessment**: Pending (Phase 8)
- **Roadmap Engine**: Pending (Phase 9)
- **Progress Persistence**: Pending (Phase 10)
- **Production Deployment**: Pending (Phase 14)
- **SEO Production Configuration**: Pending (Domain configuration & SSR/SSG rendering optimization)
- **Security Hardening**: Pending (Phase 12 server-side validation & CSP headers)

> **Phase 2 Update**: Connected to PostgreSQL / Supabase backend architecture with 14 normalized tables, 1:1 `auth.users` ↔ `profiles` linkage, strict Row Level Security (RLS) policies, answer-key isolation, task-completion ownership validation, reproducible migrations, and seed reference catalog.

---

## Architecture & Structure

```
c:\Users\rajki\Desktop\AI ROADMAP\
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── supabase/
│   └── migrations/
│       ├── 20260919000000_initial_schema.sql
│       └── 20260919000001_seed_reference_data.sql
├── src/
│   ├── components/
│   │   ├── ui/          # Accessible design system primitives
│   │   ├── common/      # Navbar, Footer, SEOHead
│   │   └── layout/      # PublicLayout, AuthLayout, DashboardLayout
│   ├── features/
│   │   ├── auth/        # AuthProvider, AuthContext, useAuth, LoginForm, SignupForm, ForgotPasswordForm
│   │   ├── onboarding/  # OnboardingWizard (6-step wizard)
│   │   └── dashboard/   # DashboardShell (honest empty state)
│   ├── lib/
│   │   └── supabase.ts  # Supabase Client SDK instance
│   ├── services/
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   └── careerService.ts
│   ├── pages/           # Public, Auth, Dashboard, NotFound pages
│   ├── routes/          # AppRoutes.tsx
│   ├── types/           # index.ts, database.ts
│   ├── utils/           # seo.ts, validation.ts, accessibility.ts
│   ├── index.css
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Technical Verification Results

- **TypeScript Verification**: `npx tsc --noEmit` — 0 errors
- **Linter Verification**: `npm run lint` (`oxlint`) — 0 errors, 0 warnings
- **Production Build**: `npm run build` — Clean Vite build output

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checks
npx tsc --noEmit

# Run linter
npm run lint

# Build production bundle
npm run build
```
