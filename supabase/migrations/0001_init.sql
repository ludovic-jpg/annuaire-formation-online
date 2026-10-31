-- =====================================================================
-- Annuaire Formation Online — schéma initial (MVP, 31/10/2026)
-- Idempotent : peut être rejoué sans erreur.
-- Toute la sécurité passe par RLS (aucune clé de service côté appli).
-- =====================================================================


-- ---------------------------------------------------------------------
-- Fonctions d'autorisation
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'email') = 'ludovic@formatrix.fr', false);
$$;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users (id) on delete set null default auth.uid(),
  name        text not null check (char_length(name) between 2 and 160),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  siret       text check (siret is null or siret ~ '^[0-9]{14}$'),
  nda         text check (nda is null or char_length(nda) <= 20),
  qualiopi    boolean not null default false,
  website     text check (website is null or website ~* '^https?://'),
  logo_url    text,
  city        text,
  region      text,
  description text check (description is null or char_length(description) <= 2000),
  is_group    boolean not null default false,
  link_rel    text not null default 'ugc' check (link_rel in ('sponsored', 'ugc')),
  status      text not null default 'pending' check (status in ('pending', 'active', 'rejected')),
  created_at  timestamptz not null default now()
);

create table if not exists public.programs (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations (id) on delete cascade,
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null check (char_length(title) between 3 and 200),
  summary         text,
  objectives      text[] not null default '{}',
  audience        text,
  prerequisites   text,
  duration_text   text,
  price_text      text,
  modality        text check (modality is null or modality in ('presentiel', 'distanciel', 'mixte')),
  sphere          text check (sphere is null or sphere in (
                    'digital-bureautique', 'management-rh', 'bien-etre-massage', 'langues',
                    'vente-commerce', 'comptabilite-finance', 'metiers-specifiques',
                    'rse-culture', 'bilan-de-competences')),
  city            text,
  certification   text check (certification is null or certification in ('LILATE', 'ICDL')),
  cpf_eligible    boolean not null default false,
  source_url      text check (source_url is null or source_url ~* '^https?://'),
  image_url       text,
  also_offered_by jsonb not null default '[]'::jsonb check (jsonb_typeof(also_offered_by) = 'array'),
  status          text not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
  reject_reason   text,
  completeness    int not null default 0 check (completeness between 0 and 100),
  indexable       boolean not null default true,
  search          tsvector generated always as (
                    setweight(to_tsvector('french'::regconfig, coalesce(title, '')), 'A') ||
                    setweight(to_tsvector('french'::regconfig, coalesce(summary, '')), 'B') ||
                    setweight(to_tsvector('french'::regconfig, coalesce(audience, '') || ' ' || coalesce(city, '')), 'C')
                  ) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

create table if not exists public.moderation_log (
  id         bigint generated always as identity primary key,
  program_id uuid references public.programs (id) on delete cascade,
  actor      text not null default coalesce(auth.jwt() ->> 'email', 'system'),
  action     text not null check (action in ('approve', 'reject', 'unpublish', 'org_activate', 'org_reject', 'note')),
  reason     text,
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist (
  id         bigint generated always as identity primary key,
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  org_name   text check (org_name is null or char_length(org_name) <= 160),
  siret      text check (siret is null or siret ~ '^[0-9]{14}$'),
  website    text check (website is null or char_length(website) <= 300),
  message    text check (message is null or char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id         bigint generated always as identity primary key,
  program_id uuid not null references public.programs (id) on delete cascade,
  org_id     uuid references public.organizations (id) on delete cascade,
  name       text not null check (char_length(name) between 2 and 120),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  message    text not null check (char_length(message) between 5 and 2000),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Index (colonnes filtrées par les policies et par les pages publiques)
-- ---------------------------------------------------------------------
create index if not exists organizations_owner_id_idx on public.organizations (owner_id);
create index if not exists organizations_status_idx   on public.organizations (status);
create index if not exists programs_org_id_idx        on public.programs (org_id);
create index if not exists programs_status_idx        on public.programs (status);
create index if not exists programs_sphere_idx        on public.programs (sphere) where status = 'published';
create index if not exists programs_city_idx          on public.programs (city) where status = 'published';
create index if not exists programs_published_at_idx  on public.programs (published_at desc) where status = 'published';
create index if not exists programs_search_idx        on public.programs using gin (search);
create index if not exists moderation_log_program_idx on public.moderation_log (program_id);
create index if not exists contact_requests_org_idx   on public.contact_requests (org_id);
create index if not exists contact_requests_prog_idx  on public.contact_requests (program_id);

-- Fonction d'appartenance (après création des tables)
create or replace function public.owns_org(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organizations o
    where o.id = p_org and o.owner_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------

-- updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

-- Garde-fou organisations : seuls les admins décident du statut, du groupe et du rel
create or replace function public.guard_organizations()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status   := 'pending';
      new.is_group := false;
      new.owner_id := auth.uid();
    else
      new.status   := old.status;
      new.is_group := old.is_group;
      new.owner_id := old.owner_id;
    end if;
  end if;
  -- Règle des liens : sponsored pour les marques du groupe, ugc sinon
  new.link_rel := case when new.is_group then 'sponsored' else 'ugc' end;
  return new;
end $$;

drop trigger if exists organizations_guard on public.organizations;
create trigger organizations_guard
  before insert or update on public.organizations
  for each row execute function public.guard_organizations();

-- Garde-fou programmes : un utilisateur ne peut viser que draft/pending,
-- ne touche ni à l'indexation ni aux champs de modération
create or replace function public.guard_programs()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not public.is_admin() then
    if new.status not in ('draft', 'pending') then
      raise exception 'Seul l''administrateur peut publier ou refuser une fiche'
        using errcode = '42501';
    end if;
    if tg_op = 'INSERT' then
      new.indexable     := true;
      new.reject_reason := null;
      new.published_at  := null;
    else
      new.indexable    := old.indexable;
      new.published_at := old.published_at;
      new.org_id       := old.org_id;
      if new.status = 'pending' then
        new.reject_reason := null;
      else
        new.reject_reason := old.reject_reason;
      end if;
    end if;
  else
    if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
      new.published_at := coalesce(new.published_at, now());
      new.reject_reason := null;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists programs_guard on public.programs;
create trigger programs_guard
  before insert or update on public.programs
  for each row execute function public.guard_programs();

-- 1er programme d'un utilisateur extérieur → organisation en revue
create or replace function public.org_pending_on_first_program()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    update public.organizations o
       set status = 'pending'
     where o.id = new.org_id
       and o.status <> 'active'
       and not exists (
         select 1 from public.programs p where p.org_id = new.org_id and p.id <> new.id
       );
  end if;
  return new;
end $$;

drop trigger if exists programs_first_program on public.programs;
create trigger programs_first_program
  after insert on public.programs
  for each row execute function public.org_pending_on_first_program();

-- Demande de contact : l'organisme est déduit du programme (pas de falsification)
create or replace function public.contact_set_org()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select p.org_id into new.org_id from public.programs p where p.id = new.program_id;
  return new;
end $$;

drop trigger if exists contact_requests_set_org on public.contact_requests;
create trigger contact_requests_set_org
  before insert on public.contact_requests
  for each row execute function public.contact_set_org();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.organizations    enable row level security;
alter table public.programs         enable row level security;
alter table public.moderation_log   enable row level security;
alter table public.waitlist         enable row level security;
alter table public.contact_requests enable row level security;

-- organizations
drop policy if exists organizations_select_public on public.organizations;
create policy organizations_select_public on public.organizations
  for select to anon, authenticated
  using (status = 'active');

drop policy if exists organizations_select_own on public.organizations;
create policy organizations_select_own on public.organizations
  for select to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists organizations_insert_own on public.organizations;
create policy organizations_insert_own on public.organizations
  for insert to authenticated
  with check (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists organizations_update_own on public.organizations;
create policy organizations_update_own on public.organizations
  for update to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()))
  with check (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists organizations_delete_admin on public.organizations;
create policy organizations_delete_admin on public.organizations
  for delete to authenticated
  using ((select public.is_admin()));

-- programs
drop policy if exists programs_select_public on public.programs;
create policy programs_select_public on public.programs
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (select 1 from public.organizations o where o.id = org_id and o.status = 'active')
  );

drop policy if exists programs_select_own on public.programs;
create policy programs_select_own on public.programs
  for select to authenticated
  using ((select public.owns_org(org_id)) or (select public.is_admin()));

drop policy if exists programs_insert_own on public.programs;
create policy programs_insert_own on public.programs
  for insert to authenticated
  with check (
    (select public.is_admin())
    or ((select public.owns_org(org_id)) and status in ('draft', 'pending'))
  );

drop policy if exists programs_update_own on public.programs;
create policy programs_update_own on public.programs
  for update to authenticated
  using ((select public.owns_org(org_id)) or (select public.is_admin()))
  with check (
    (select public.is_admin())
    or ((select public.owns_org(org_id)) and status in ('draft', 'pending'))
  );

drop policy if exists programs_delete_own on public.programs;
create policy programs_delete_own on public.programs
  for delete to authenticated
  using (
    (select public.is_admin())
    or ((select public.owns_org(org_id)) and status in ('draft', 'pending', 'rejected'))
  );

-- moderation_log : admin uniquement
drop policy if exists moderation_log_admin_all on public.moderation_log;
create policy moderation_log_admin_all on public.moderation_log
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- waitlist : insertion publique, lecture admin
drop policy if exists waitlist_insert_public on public.waitlist;
create policy waitlist_insert_public on public.waitlist
  for insert to anon, authenticated
  with check (true);

drop policy if exists waitlist_select_admin on public.waitlist;
create policy waitlist_select_admin on public.waitlist
  for select to authenticated
  using ((select public.is_admin()));

-- contact_requests : insertion publique sur une fiche publiée, lecture OF propriétaire + admin
drop policy if exists contact_requests_insert_public on public.contact_requests;
create policy contact_requests_insert_public on public.contact_requests
  for insert to anon, authenticated
  with check (
    exists (select 1 from public.programs p where p.id = program_id and p.status = 'published')
  );

drop policy if exists contact_requests_select_owner on public.contact_requests;
create policy contact_requests_select_owner on public.contact_requests
  for select to authenticated
  using ((select public.owns_org(org_id)) or (select public.is_admin()));

-- ---------------------------------------------------------------------
-- Droits de base (RLS filtre ensuite)
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.organizations, public.programs to anon, authenticated;
grant insert, update, delete on public.organizations, public.programs to authenticated;
grant insert on public.waitlist, public.contact_requests to anon, authenticated;
grant select on public.waitlist, public.contact_requests to authenticated;
grant select, insert on public.moderation_log to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_org(uuid) to anon, authenticated;
