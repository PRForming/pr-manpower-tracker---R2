
# Browser-safe Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=sam@prforming.com

# Server-only variables: add in Vercel, never commit real values
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxxx
DAILY_SUMMARY_TO=sam@prforming.com
DAILY_SUMMARY_FROM=PR Forming <manpower@your-verified-domain.com>
CRON_SECRET=use-a-long-random-secret

node_modules
.next
.env.local
.vercel

/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

{
  "name": "pr-manpower-tracker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0",
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}

# PR Forming Manpower Tracker

Private, mobile-friendly daily manpower tracking for eight projects.

## Included

- Sign-in through Supabase Authentication
- PR Forming hourly employee quantities
- Subcontractor dropdown plus **Other** company entry
- Draft and submitted reports
- Copy previous day
- Private administrator dashboard for `sam@prforming.com`
- Stock-style 30-day manpower trend chart
- Scheduled 10:00 AM Vancouver email endpoint

## Projects

1. Sky Living - Surry
2. Sony Tower
3. Prior St - Vancouver
4. CCNE - Surry - Blue City
5. 10th & Discovery - Vancouver
6. Uptown Phase 4
7. 1045 Burnaby
8. Poor Italian

## Database setup

For a new Supabase project, run these files in the SQL Editor in this order:

1. `supabase/schema.sql`
2. `supabase/update-projects.sql` only if you previously used the placeholder project list
3. `supabase/privacy-update.sql`
4. `supabase/email-update.sql`

Create users in **Authentication → Users**. The exact account `sam@prforming.com` becomes the administrator. Other users can only see their own reports; Sam can see all reports and the private dashboard.

## Vercel environment variables

Add all of these in **Project Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ADMIN_EMAIL=sam@prforming.com
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
DAILY_SUMMARY_TO=sam@prforming.com
DAILY_SUMMARY_FROM=PR Forming <manpower@your-verified-domain.com>
CRON_SECRET=a-long-random-value
```

Never put the service-role key or Resend key in a `NEXT_PUBLIC_...` variable.

## Email setup

1. Create a Resend account and verify a sending domain.
2. Add the Resend API key and verified From address to Vercel.
3. Run `supabase/email-update.sql`.
4. Deploy. `vercel.json` calls `/api/daily-summary` hourly; the endpoint sends only during the 10:00 AM hour in `America/Vancouver` and records delivery to prevent duplicates.

Vercel plan limits can affect cron frequency. If hourly cron is unavailable on your plan, use any scheduler that can call the endpoint hourly with this header:

```text
Authorization: Bearer YOUR_CRON_SECRET
```

The endpoint can be tested manually with `/api/daily-summary?force=1`, using the same Authorization header.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

{
  "crons": [
    { "path": "/api/daily-summary", "schedule": "0 * * * *" }
  ]
}
