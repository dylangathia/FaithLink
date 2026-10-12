-- Sanctuary: multi-church foundation
-- Churches, roles, memberships, join codes (also used for QR codes) and personal invitations.
-- Every church's data is private to its members; this is enforced with row-level security.

-- Safe to run more than once.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.church_role as enum ('owner', 'admin', 'leader', 'member');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.membership_status as enum ('pending', 'active', 'removed');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.invitation_status as enum ('pending', 'accepted', 'revoked');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  city text,
  country text,
  logo_url text,
  -- Default for new join codes: whether people joining by code wait for approval
  require_approval boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.church_members (
  church_id uuid not null references public.churches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.church_role not null default 'member',
  status public.membership_status not null default 'active',
  joined_via text not null default 'invite' check (joined_via in ('creator', 'invite', 'code')),
  created_at timestamptz not null default now(),
  primary key (church_id, user_id)
);
create index if not exists church_members_user_idx on public.church_members (user_id);

create table if not exists public.join_codes (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id) on delete cascade,
  code text not null unique,
  label text not null default 'General',
  role public.church_role not null default 'member' check (role in ('member', 'leader')),
  requires_approval boolean not null default true,
  max_uses integer check (max_uses is null or max_uses > 0),
  uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists join_codes_church_idx on public.join_codes (church_id);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id) on delete cascade,
  full_name text not null default '',
  email text,   -- stored lower-case
  phone text,   -- stored as digits only, international format (e.g. 254712345678)
  role public.church_role not null default 'member' check (role <> 'owner'),
  token text not null unique default encode(extensions.gen_random_bytes(18), 'hex'),
  status public.invitation_status not null default 'pending',
  invited_by uuid references public.profiles (id) on delete set null,
  accepted_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);
create index if not exists invitations_church_idx on public.invitations (church_id);
create index if not exists invitations_email_idx on public.invitations (email) where status = 'pending';
create index if not exists invitations_phone_idx on public.invitations (phone) where status = 'pending';

-- ---------------------------------------------------------------------------
-- Profiles are created automatically for every new account
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), lower(new.email), new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created before this script ran get their profile now
insert into public.profiles (id, full_name, email, phone)
select id, coalesce(raw_user_meta_data ->> 'full_name', ''), lower(email), phone
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Permission helpers (security definer so policies can use them without recursion)
-- ---------------------------------------------------------------------------

-- The caller's role in a church, or null if they are not an active member
create or replace function public.church_role_of(p_church uuid)
returns public.church_role
language sql stable security definer set search_path = public
as $$
  select role from church_members
  where church_id = p_church and user_id = auth.uid() and status = 'active'
$$;

create or replace function public.is_church_member(p_church uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.church_role_of(p_church) is not null
$$;

create or replace function public.is_church_admin(p_church uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.church_role_of(p_church) in ('owner', 'admin'), false)
$$;

-- Pending members can still see the church they asked to join
create or replace function public.has_membership(p_church uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from church_members
    where church_id = p_church and user_id = auth.uid() and status <> 'removed'
  )
$$;

-- True when the caller and another user belong to the same church (any status for admins)
create or replace function public.shares_church_with(p_other uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from church_members me
    join church_members them on them.church_id = me.church_id
    where me.user_id = auth.uid()
      and me.status = 'active'
      and them.user_id = p_other
      and (them.status = 'active' or me.role in ('owner', 'admin'))
  )
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.churches enable row level security;
alter table public.church_members enable row level security;
alter table public.join_codes enable row level security;
alter table public.invitations enable row level security;

drop policy if exists "Read own profile and fellow members" on public.profiles;
create policy "Read own profile and fellow members" on public.profiles
  for select using (id = auth.uid() or public.shares_church_with(id));
drop policy if exists "Create own profile" on public.profiles;
create policy "Create own profile" on public.profiles
  for insert with check (id = auth.uid());
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Members can see their church" on public.churches;
create policy "Members can see their church" on public.churches
  for select using (public.has_membership(id));
drop policy if exists "Admins can update their church" on public.churches;
create policy "Admins can update their church" on public.churches
  for update using (public.is_church_admin(id)) with check (public.is_church_admin(id));

-- Members see the active directory; admins also see pending and removed people
drop policy if exists "See church memberships" on public.church_members;
create policy "See church memberships" on public.church_members
  for select using (
    user_id = auth.uid()
    or public.is_church_admin(church_id)
    or (status = 'active' and public.is_church_member(church_id))
  );

drop policy if exists "Admins manage join codes" on public.join_codes;
create policy "Admins manage join codes" on public.join_codes
  for select using (public.is_church_admin(church_id));
drop policy if exists "Admins update join codes" on public.join_codes;
create policy "Admins update join codes" on public.join_codes
  for update using (public.is_church_admin(church_id)) with check (public.is_church_admin(church_id));
drop policy if exists "Admins delete join codes" on public.join_codes;
create policy "Admins delete join codes" on public.join_codes
  for delete using (public.is_church_admin(church_id));

drop policy if exists "Admins see invitations" on public.invitations;
create policy "Admins see invitations" on public.invitations
  for select using (public.is_church_admin(church_id));
drop policy if exists "Admins update invitations" on public.invitations;
create policy "Admins update invitations" on public.invitations
  for update using (public.is_church_admin(church_id)) with check (public.is_church_admin(church_id));

-- Creating rows and changing memberships happens only through the functions below.

-- ---------------------------------------------------------------------------
-- Join codes
-- ---------------------------------------------------------------------------

-- Readable codes like GRACE-7K2P (no 0/O/1/I to avoid confusion when read aloud)
create or replace function public.generate_join_code(p_church_name text)
returns text
language plpgsql
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  prefix text;
  suffix text;
  candidate text;
begin
  prefix := upper(left(regexp_replace(regexp_replace(coalesce(p_church_name, ''), '^\s*the\s+', '', 'i'), '[^A-Za-z]', '', 'g'), 5));
  if prefix = '' then
    prefix := 'CHURCH';
  end if;
  loop
    suffix := '';
    for i in 1..4 loop
      suffix := suffix || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    candidate := prefix || '-' || suffix;
    exit when not exists (select 1 from join_codes where code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.create_join_code(
  p_church uuid,
  p_label text default 'General',
  p_role public.church_role default 'member',
  p_requires_approval boolean default null,
  p_max_uses integer default null,
  p_expires_at timestamptz default null
)
returns public.join_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  church_row churches;
  result join_codes;
begin
  if not public.is_church_admin(p_church) then
    raise exception 'Only church admins can create join codes';
  end if;
  if p_role not in ('member', 'leader') then
    raise exception 'Join codes can only grant the member or leader role';
  end if;
  select * into church_row from churches where id = p_church;

  insert into join_codes (church_id, code, label, role, requires_approval, max_uses, expires_at, created_by)
  values (
    p_church,
    public.generate_join_code(church_row.name),
    coalesce(nullif(trim(p_label), ''), 'General'),
    p_role,
    coalesce(p_requires_approval, church_row.require_approval),
    p_max_uses,
    p_expires_at,
    auth.uid()
  )
  returning * into result;
  return result;
end;
$$;

-- Public preview for the join page (works before signing in)
create or replace function public.preview_join_code(p_code text)
returns table (church_id uuid, church_name text, city text, country text, logo_url text, requires_approval boolean)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.name, c.city, c.country, c.logo_url, jc.requires_approval
  from join_codes jc
  join churches c on c.id = jc.church_id
  where jc.code = upper(trim(p_code))
    and jc.active
    and (jc.expires_at is null or jc.expires_at > now())
    and (jc.max_uses is null or jc.uses < jc.max_uses)
$$;

create or replace function public.join_with_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  jc join_codes;
  existing church_members;
  had_membership boolean;
  new_status membership_status;
begin
  if auth.uid() is null then
    raise exception 'Please sign in to join a church';
  end if;

  select * into jc from join_codes where code = upper(trim(p_code)) for update;
  if not found or not jc.active then
    raise exception 'This code is not valid';
  end if;
  if jc.expires_at is not null and jc.expires_at < now() then
    raise exception 'This code has expired';
  end if;
  if jc.max_uses is not null and jc.uses >= jc.max_uses then
    raise exception 'This code has reached its limit';
  end if;

  select * into existing from church_members where church_id = jc.church_id and user_id = auth.uid();
  had_membership := found;
  if had_membership and existing.status <> 'removed' then
    return json_build_object('church_id', jc.church_id, 'status', existing.status);
  end if;

  -- Someone previously removed always goes back through approval
  new_status := case when jc.requires_approval or had_membership then 'pending' else 'active' end;

  insert into church_members (church_id, user_id, role, status, joined_via)
  values (jc.church_id, auth.uid(), jc.role, new_status, 'code')
  on conflict (church_id, user_id)
    do update set role = excluded.role, status = excluded.status, joined_via = 'code', created_at = now();

  update join_codes set uses = uses + 1 where id = jc.id;

  return json_build_object('church_id', jc.church_id, 'status', new_status);
end;
$$;

-- ---------------------------------------------------------------------------
-- Churches
-- ---------------------------------------------------------------------------

-- Creates a church, makes the caller its owner and issues a first join code
create or replace function public.create_church(
  p_name text,
  p_city text default null,
  p_country text default null,
  p_require_approval boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Please sign in to create a church';
  end if;

  insert into churches (name, city, country, require_approval, created_by)
  values (trim(p_name), nullif(trim(p_city), ''), nullif(trim(p_country), ''), p_require_approval, auth.uid())
  returning id into new_id;

  insert into church_members (church_id, user_id, role, status, joined_via)
  values (new_id, auth.uid(), 'owner', 'active', 'creator');

  perform public.create_join_code(new_id, 'General');
  return new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Invitations (an admin adds someone by email or phone)
-- ---------------------------------------------------------------------------

create or replace function public.create_invitation(
  p_church uuid,
  p_full_name text,
  p_email text default null,
  p_phone text default null,
  p_role public.church_role default 'member'
)
returns public.invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_email text := nullif(lower(trim(p_email)), '');
  clean_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  result invitations;
begin
  if not public.is_church_admin(p_church) then
    raise exception 'Only church admins can invite people';
  end if;
  if clean_email is null and clean_phone is null then
    raise exception 'Add an email address or phone number';
  end if;
  if p_role = 'owner' then
    raise exception 'A church can only have one owner';
  end if;
  if p_role = 'admin' and public.church_role_of(p_church) <> 'owner' then
    raise exception 'Only the owner can invite admins';
  end if;

  insert into invitations (church_id, full_name, email, phone, role, invited_by)
  values (p_church, trim(coalesce(p_full_name, '')), clean_email, clean_phone, p_role, auth.uid())
  returning * into result;
  return result;
end;
$$;

-- Public preview for the invite page
create or replace function public.preview_invitation(p_token text)
returns table (church_id uuid, church_name text, city text, logo_url text, full_name text, role public.church_role)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.name, c.city, c.logo_url, i.full_name, i.role
  from invitations i
  join churches c on c.id = i.church_id
  where i.token = p_token and i.status = 'pending'
$$;

-- Shared by accept_invitation and claim_invitations
create or replace function public.apply_invitation(inv public.invitations, p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into church_members (church_id, user_id, role, status, joined_via)
  values (inv.church_id, p_user, inv.role, 'active', 'invite')
  on conflict (church_id, user_id) do update
    set status = 'active',
        -- Keep an existing active member's role; otherwise use the invited role
        role = case when church_members.status = 'active' then church_members.role else excluded.role end;

  update invitations
  set status = 'accepted', accepted_by = p_user, accepted_at = now()
  where id = inv.id;

  -- Fill in the person's name if they haven't set one yet
  update profiles set full_name = inv.full_name
  where id = p_user and full_name = '' and inv.full_name <> '';
end;
$$;

revoke execute on function public.apply_invitation(public.invitations, uuid) from public, anon, authenticated;

create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv invitations;
begin
  if auth.uid() is null then
    raise exception 'Please sign in to accept this invitation';
  end if;
  select * into inv from invitations where token = p_token and status = 'pending' for update;
  if not found then
    raise exception 'This invitation is no longer valid';
  end if;
  perform public.apply_invitation(inv, auth.uid());
  return inv.church_id;
end;
$$;

-- Called after every sign-in: joins any church that invited this email or phone number
create or replace function public.claim_invitations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  user_phone text;
  inv invitations;
  claimed integer := 0;
begin
  if auth.uid() is null then
    return 0;
  end if;
  select lower(email), regexp_replace(coalesce(phone, ''), '\D', '', 'g')
  into user_email, user_phone
  from auth.users where id = auth.uid();

  for inv in
    select * from invitations
    where status = 'pending'
      and ((user_email is not null and email = user_email)
        or (user_phone <> '' and phone = user_phone))
    for update
  loop
    perform public.apply_invitation(inv, auth.uid());
    claimed := claimed + 1;
  end loop;
  return claimed;
end;
$$;

-- ---------------------------------------------------------------------------
-- Managing members
-- ---------------------------------------------------------------------------

create or replace function public.set_member_role(p_church uuid, p_user uuid, p_role public.church_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role church_role := public.church_role_of(p_church);
  target_role church_role;
begin
  if caller_role is null or caller_role not in ('owner', 'admin') then
    raise exception 'Only church admins can change roles';
  end if;
  select role into target_role from church_members where church_id = p_church and user_id = p_user;
  if not found then
    raise exception 'Member not found';
  end if;
  if p_role = 'owner' then
    raise exception 'Ownership transfer is not supported yet';
  end if;
  if target_role = 'owner' then
    raise exception 'The owner''s role cannot be changed';
  end if;
  if (target_role = 'admin' or p_role = 'admin') and caller_role <> 'owner' then
    raise exception 'Only the owner can add or remove admins';
  end if;

  update church_members set role = p_role where church_id = p_church and user_id = p_user;
end;
$$;

-- Approve a pending member ('active') or remove someone ('removed')
create or replace function public.set_member_status(p_church uuid, p_user uuid, p_status public.membership_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role church_role := public.church_role_of(p_church);
  target_role church_role;
begin
  if caller_role is null or caller_role not in ('owner', 'admin') then
    raise exception 'Only church admins can manage members';
  end if;
  if p_status = 'pending' then
    raise exception 'Invalid status';
  end if;
  select role into target_role from church_members where church_id = p_church and user_id = p_user;
  if not found then
    raise exception 'Member not found';
  end if;
  if target_role = 'owner' then
    raise exception 'The owner cannot be removed';
  end if;
  if target_role = 'admin' and caller_role <> 'owner' then
    raise exception 'Only the owner can remove admins';
  end if;

  update church_members set status = p_status where church_id = p_church and user_id = p_user;
end;
$$;

create or replace function public.leave_church(p_church uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.church_role_of(p_church) = 'owner' then
    raise exception 'The owner cannot leave their church';
  end if;
  delete from church_members where church_id = p_church and user_id = auth.uid();
end;
$$;

-- Make the new tables and functions visible to the API straight away
notify pgrst, 'reload schema';
