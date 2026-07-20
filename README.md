# PR Forming Manpower Tracker

A responsive daily manpower entry website for eight projects. It includes PR Forming hourly manpower, selectable subcontractors, automatic totals, draft/submitted status, previous-day copying, and a dashboard.

## Instant demo

Run without Supabase and the app saves records in the current browser:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Shared production setup

### 1. Create the database

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. In **Authentication**, create the superintendent users or enable the preferred email sign-in method.
4. Copy the Project URL and publishable/anon key.

### 2. Configure the app

Copy `.env.example` to `.env.local` and enter:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

### 3. Deploy on Vercel

1. Put this project in a GitHub repository.
2. Import the repository into Vercel.
3. Add the two environment variables in Vercel Project Settings.
4. Deploy.

The generated Vercel URL can then be shared with the eight project teams.

## Important before company-wide use

The included SQL policies allow any authenticated user to view and edit all project reports. This is suitable for a small trusted superintendent group. For stricter access, add a `project_members` table and project-specific RLS policies.

## Customize projects

Update both:

- `lib/constants.ts`
- the seed project names in `supabase/schema.sql`

## Subcontractor list

Muluk, Leavitt Machinery, Platinum, Power Shotcrete, Rappicone, NRG, and Able are preloaded in the form.

## Confirmed project list

1. Sky Living - Surry
2. Sony Tower
3. Prior St - Vancouver
4. CCNE - Surry - Blue City
5. 10th & Discovery - Vancouver
6. Uptown Phase 4
7. 1045 Burnaby
8. Poor Italian

If you already ran the earlier database script, run `supabase/update-projects.sql` once in the Supabase SQL Editor. For a brand-new database, run only `supabase/schema.sql`.
