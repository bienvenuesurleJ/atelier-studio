-- Atelier Local — à coller en une fois dans le SQL Editor de Supabase.
-- Idempotent : on peut le relancer. Aucune clé secrète n’est utilisée ici.

create or replace function public.atelier_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.documents (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('studio', 'films')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);

create table if not exists public.files (
  user_id uuid not null references auth.users (id) on delete cascade,
  hash text not null,
  name text not null default '',
  mime text not null default 'application/octet-stream',
  bytes bigint not null default 0 check (bytes >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, hash)
);

create index if not exists documents_updated_idx on public.documents (updated_at desc);
create index if not exists files_user_updated_idx on public.files (user_id, updated_at desc);

drop trigger if exists atelier_documents_touch on public.documents;
create trigger atelier_documents_touch
  before insert or update on public.documents
  for each row execute function public.atelier_touch_updated_at();

drop trigger if exists atelier_files_touch on public.files;
create trigger atelier_files_touch
  before insert or update on public.files
  for each row execute function public.atelier_touch_updated_at();

alter table public.documents enable row level security;
alter table public.files enable row level security;
alter table public.documents force row level security;
alter table public.files force row level security;

revoke all on table public.documents from public, anon;
revoke all on table public.files from public, anon;
grant select, insert, update, delete on table public.documents to authenticated;
grant select, insert, update, delete on table public.files to authenticated;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
  on public.documents
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
  on public.documents
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own"
  on public.documents
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
  on public.documents
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "files_select_own" on public.files;
create policy "files_select_own"
  on public.files
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "files_insert_own" on public.files;
create policy "files_insert_own"
  on public.files
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "files_update_own" on public.files;
create policy "files_update_own"
  on public.files
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "files_delete_own" on public.files;
create policy "files_delete_own"
  on public.files
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit)
values ('atelier-files', 'atelier-files', false, 52428800)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "atelier_files_select" on storage.objects;
create policy "atelier_files_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'atelier-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "atelier_files_insert" on storage.objects;
create policy "atelier_files_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'atelier-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "atelier_files_update" on storage.objects;
create policy "atelier_files_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'atelier-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'atelier-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "atelier_files_delete" on storage.objects;
create policy "atelier_files_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'atelier-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
