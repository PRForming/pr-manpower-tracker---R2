-- Run this once in Supabase SQL Editor if you already ran the original schema.sql.
-- It replaces the placeholder project list with the eight confirmed projects.

begin;

-- Remove only unused placeholder projects from the original setup.
delete from public.projects
where name in ('Blue City', 'Project 5', 'Project 6', 'Project 7', 'Project 8')
  and not exists (
    select 1 from public.daily_reports r where r.project_id = projects.id
  );

insert into public.projects(name) values
  ('Sky Living - Surry'),
  ('Sony Tower'),
  ('Prior St - Vancouver'),
  ('CCNE - Surry - Blue City'),
  ('10th & Discovery - Vancouver'),
  ('Uptown Phase 4'),
  ('1045 Burnaby'),
  ('Poor Italian')
on conflict (name) do nothing;

commit;
