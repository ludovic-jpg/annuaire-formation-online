-- Rubriques complètes de la matrice des parcours, reprises 1/1 des pages sources.
alter table public.programs
  add column if not exists level_text text,
  add column if not exists short_objective text,
  add column if not exists highlights text,
  add column if not exists modalities_text text,
  add column if not exists program_md text,
  add column if not exists results_expected text,
  add column if not exists evaluation text,
  add column if not exists accessibility text,
  add column if not exists access_delay text,
  add column if not exists extra_sections jsonb not null default '[]'::jsonb,
  add column if not exists source_site text,
  add column if not exists source_synced_at timestamptz;
create unique index if not exists programs_source_url_key on public.programs (source_url) where source_url is not null;
