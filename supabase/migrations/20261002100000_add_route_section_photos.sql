alter table public.guide_sections
  add column if not exists photos text[] not null default '{}';
