Welcome to ProClassic
This is a platform dedicated to artists and institutions in the classical music industry.
It is intended to allow an easier and faster networking for the artists and the institutions and give a more broad and varied list of opportunities for both parties.

It is built with Next.js.
On a later stage this app will be developen on mobile.

## Supabase schema (run in SQL editor)

```sql
-- USERS AND ROLES
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('basic','artist','institution')),
  created_at timestamptz not null default now()
);

-- ARTIST PROFILE
create table if not exists public.artist_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  location text,
  voice_type text,
  artist_type text,
  avatar_url text,
  schools text[] default '{}',
  repertoire jsonb default '[]',
  media jsonb default '[]',
  career jsonb default '[]',
  updated_at timestamptz not null default now()
);

-- INSTITUTION PROFILE
create table if not exists public.institution_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  city text,
  website text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

-- OPPORTUNITIES (already referenced by UI)
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('audition','gig','competition')) default 'gig',
  location text,
  role_tags text[] default '{}',
  level text,
  deadline date,
  pay_range text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.user_roles enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.institution_profiles enable row level security;
alter table public.opportunities enable row level security;

-- Policies: user_roles
create policy "read own role" on public.user_roles
  for select using (auth.uid() = user_id);
create policy "set own role" on public.user_roles
  for insert with check (auth.uid() = user_id);
create policy "update own role" on public.user_roles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: artist_profiles
create policy "read artist_profiles public" on public.artist_profiles
  for select using (true);
create policy "upsert own artist_profile" on public.artist_profiles
  for insert with check (auth.uid() = id);
create policy "update own artist_profile" on public.artist_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Policies: institution_profiles
create policy "read institution_profiles public" on public.institution_profiles
  for select using (true);
create policy "upsert own institution_profile" on public.institution_profiles
  for insert with check (auth.uid() = id);
create policy "update own institution_profile" on public.institution_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Policies: opportunities
create policy "read opportunities public" on public.opportunities
  for select using (true);
create policy "insert opportunities institutions" on public.opportunities
  for insert with check (
    exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'institution')
  );
create policy "update opportunities owner" on public.opportunities
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

-- STORAGE
-- Buckets: avatars, artist-media
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('artist-media','artist-media', true)
  on conflict (id) do nothing;

-- Storage policies: allow public read, owner write
create policy "Public read avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload own avatars" on storage.objects for insert with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text
);
create policy "Owner can update/delete avatars" on storage.objects for all using (
  bucket_id = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Public read artist-media" on storage.objects for select using (bucket_id = 'artist-media');
create policy "Users can upload own media" on storage.objects for insert with check (
  bucket_id = 'artist-media' and (storage.foldername(name))[1] in ('media','career') and (storage.foldername(name))[2] = auth.uid()::text
);
create policy "Owner can update/delete artist-media" on storage.objects for all using (
  bucket_id = 'artist-media' and (storage.foldername(name))[2] = auth.uid()::text
);
```
