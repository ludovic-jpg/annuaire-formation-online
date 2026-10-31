-- Blog des organismes + crédits de publication.
-- Règle : 1 € (100 centimes) par fiche ou article publié ; 5 € offerts à la création d'un organisme ;
-- les marques du groupe (is_group) ne sont pas débitées. Le débit a lieu à la publication (par l'admin) ;
-- l'envoi en revue exige un solde disponible d'au moins 1 €.

-- ---------------------------------------------------------------------
-- Crédits
-- ---------------------------------------------------------------------
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  amount_cents integer not null,
  reason text not null check (reason in ('bienvenue', 'publication_fiche', 'publication_article', 'recharge', 'ajustement')),
  ref_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists credit_ledger_org_idx on public.credit_ledger (org_id);
create unique index if not exists credit_ledger_once_idx on public.credit_ledger (org_id, reason, ref_id) where ref_id is not null;
alter table public.credit_ledger enable row level security;

drop policy if exists credit_ledger_select_own on public.credit_ledger;
create policy credit_ledger_select_own on public.credit_ledger
  for select to authenticated
  using ((select public.owns_org(org_id)) or (select public.is_admin()));
-- Aucune écriture directe : uniquement via les fonctions ci-dessous (security definer).

create or replace function public.org_balance_cents(p_org uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce(sum(amount_cents), 0)::integer from public.credit_ledger where org_id = p_org;
$$;
grant execute on function public.org_balance_cents(uuid) to authenticated;

create or replace function public.org_is_group(p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select is_group from public.organizations where id = p_org), false);
$$;

-- 5 € offerts à la création d'un organisme hors groupe
create or replace function public.credit_welcome()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not new.is_group then
    insert into public.credit_ledger (org_id, amount_cents, reason, ref_id) values (new.id, 500, 'bienvenue', new.id)
    on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists organizations_credit_welcome on public.organizations;
create trigger organizations_credit_welcome after insert on public.organizations
  for each row execute function public.credit_welcome();

-- Organismes extérieurs déjà créés : crédit de bienvenue rétroactif
insert into public.credit_ledger (org_id, amount_cents, reason, ref_id)
select id, 500, 'bienvenue', id from public.organizations where not is_group
on conflict do nothing;

-- Contrôle du solde à l'envoi en revue, débit à la publication (fiches et articles)
create or replace function public.credit_on_status()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_reason text := case when tg_table_name = 'posts' then 'publication_article' else 'publication_fiche' end;
begin
  if new.org_id is null or public.org_is_group(new.org_id) then
    return new;
  end if;
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status is distinct from 'pending')
     and not public.is_admin() and public.org_balance_cents(new.org_id) < 100 then
    raise exception 'Crédit insuffisant : 1 € est nécessaire pour publier (5 € offerts à l''inscription).' using errcode = 'P0001';
  end if;
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    insert into public.credit_ledger (org_id, amount_cents, reason, ref_id) values (new.org_id, -100, v_reason, new.id)
    on conflict do nothing; -- une seule facturation par fiche ou article, même après dépublication
  end if;
  return new;
end $$;
drop trigger if exists programs_credit on public.programs;
create trigger programs_credit before insert or update of status on public.programs
  for each row execute function public.credit_on_status();

-- ---------------------------------------------------------------------
-- Articles (blog des organismes ; les articles éditoriaux de La Rotative restent des fichiers)
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 10 and 140),
  seo_title text,
  description text,
  keyword text,
  body_md text not null default '',
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
  reject_reason text,
  word_count integer generated always as (coalesce(array_length(regexp_split_to_array(trim(body_md), '\s+'), 1), 0)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists posts_status_idx on public.posts (status, published_at desc);
alter table public.posts enable row level security;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

create or replace function public.guard_posts()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not public.is_admin() then
    if new.status not in ('draft', 'pending') then
      raise exception 'Seul l''administrateur peut publier ou refuser un article' using errcode = '42501';
    end if;
    if tg_op = 'INSERT' then
      new.reject_reason := null; new.published_at := null;
    else
      new.org_id := old.org_id; new.published_at := old.published_at;
      if new.status = 'pending' then new.reject_reason := null; else new.reject_reason := old.reject_reason; end if;
    end if;
  elsif new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := coalesce(new.published_at, now()); new.reject_reason := null;
  end if;
  return new;
end $$;
drop trigger if exists posts_guard on public.posts;
create trigger posts_guard before insert or update on public.posts
  for each row execute function public.guard_posts();
drop trigger if exists posts_credit on public.posts;
create trigger posts_credit before insert or update of status on public.posts
  for each row execute function public.credit_on_status();

drop policy if exists posts_select_public on public.posts;
create policy posts_select_public on public.posts for select to anon, authenticated
  using (status = 'published' and exists (select 1 from public.organizations o where o.id = org_id and o.status = 'active'));
drop policy if exists posts_select_own on public.posts;
create policy posts_select_own on public.posts for select to authenticated
  using ((select public.owns_org(org_id)) or (select public.is_admin()));
drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own on public.posts for insert to authenticated
  with check ((select public.owns_org(org_id)) or (select public.is_admin()));
drop policy if exists posts_update_own on public.posts;
create policy posts_update_own on public.posts for update to authenticated
  using ((select public.owns_org(org_id)) or (select public.is_admin()))
  with check ((select public.owns_org(org_id)) or (select public.is_admin()));
drop policy if exists posts_delete_own on public.posts;
create policy posts_delete_own on public.posts for delete to authenticated
  using (((select public.owns_org(org_id)) and status in ('draft', 'rejected')) or (select public.is_admin()));

revoke execute on function public.credit_welcome() from public, anon, authenticated;
revoke execute on function public.credit_on_status() from public, anon, authenticated;
revoke execute on function public.guard_posts() from public, anon, authenticated;
revoke execute on function public.org_is_group(uuid) from public, anon, authenticated;
