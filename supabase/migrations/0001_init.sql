-- 모바일 청첩장 서비스 초기 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하거나,
-- supabase CLI 를 쓴다면 `supabase db push` 로 적용한다.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 공통 트리거: updated_at 자동 갱신
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles : auth.users 의 공개 프로필
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at  timestamptz not null default now()
);

-- 회원가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- invitations : 청첩장 본체 (테넌트 단위)
-- ---------------------------------------------------------------------------
create type public.invitation_status as enum ('draft', 'published');

create table public.invitations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  slug          text not null unique,
  status        public.invitation_status not null default 'draft',

  groom_name    text not null default '',
  bride_name    text not null default '',
  wedding_at    timestamptz,
  venue_name    text,
  venue_address text,
  venue_lat     double precision,
  venue_lng     double precision,
  greeting      text,
  cover_image_url text,

  -- 신랑신부가 켜고 끄는 기능 플래그
  features      jsonb not null default '{"guestbook": true, "rsvp": true}'::jsonb,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- URL 로 쓰이므로 소문자/숫자/하이픈만, 3~50자
  constraint invitations_slug_format
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$')
);

create index invitations_owner_id_idx on public.invitations (owner_id);
create index invitations_slug_idx     on public.invitations (slug) where status = 'published';

create trigger invitations_set_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- 예약어 slug : 가입자가 /i/login 같은 주소를 선점하지 못하게 막는다.
create table public.reserved_slugs (
  slug text primary key
);
insert into public.reserved_slugs (slug) values
  ('admin'), ('api'), ('dashboard'), ('login'), ('logout'),
  ('signup'), ('settings'), ('help'), ('about'), ('pricing');

-- security definer 필수: reserved_slugs 는 RLS 가 켜져 있고 정책이 없다.
-- invoker 권한으로 돌면 select 가 항상 0행을 반환해 검사가 무력화된다.
create or replace function public.reject_reserved_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.reserved_slugs r where r.slug = new.slug) then
    raise exception '사용할 수 없는 주소입니다: %', new.slug
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger invitations_reject_reserved_slug
  before insert or update of slug on public.invitations
  for each row execute function public.reject_reserved_slug();

-- ---------------------------------------------------------------------------
-- 공개 여부 + 기능 활성화 여부를 한 번에 판정하는 헬퍼.
--
-- security definer 로 두어 RLS 재귀를 피한다. 반환값이 boolean 하나뿐이라
-- 이 함수로 청첩장 내용이 새어나갈 수는 없다.
-- ---------------------------------------------------------------------------
create or replace function public.invitation_accepts(inv_id uuid, feature text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.invitations i
    where i.id = inv_id
      and i.status = 'published'
      and coalesce((i.features ->> feature)::boolean, false)
  );
$$;

create or replace function public.owns_invitation(inv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.invitations i
    where i.id = inv_id
      and i.owner_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- guestbook_entries : 방명록
-- ---------------------------------------------------------------------------
create table public.guestbook_entries (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  author_name   text not null check (char_length(author_name) between 1 and 20),
  message       text not null check (char_length(message) between 1 and 500),
  -- 하객이 직접 지울 때 쓰는 4자리 비밀번호의 해시 (앱에서 bcrypt)
  password_hash text,
  is_hidden     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index guestbook_entries_invitation_idx
  on public.guestbook_entries (invitation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- rsvps : 참석 여부 회신
-- ---------------------------------------------------------------------------
create table public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  side          text not null check (side in ('groom', 'bride')),
  guest_name    text not null check (char_length(guest_name) between 1 and 20),
  attending     boolean not null,
  party_size    int not null default 1 check (party_size between 1 and 20),
  dining        boolean,
  phone         text check (phone is null or phone ~ '^[0-9-]{9,20}$'),
  note          text check (note is null or char_length(note) <= 300),
  created_at    timestamptz not null default now()
);

create index rsvps_invitation_idx on public.rsvps (invitation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.invitations       enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.rsvps             enable row level security;
alter table public.reserved_slugs    enable row level security;
-- reserved_slugs 는 정책이 없다 = 아무도 직접 읽거나 쓸 수 없다.
-- 트리거는 definer 권한으로 돌기 때문에 영향받지 않는다.

-- profiles ------------------------------------------------------------------
create policy "본인 프로필만 조회"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "본인 프로필만 수정"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- invitations ---------------------------------------------------------------
create policy "발행된 청첩장은 누구나 조회"
  on public.invitations for select to anon, authenticated
  using (status = 'published');

create policy "소유자는 초안까지 조회"
  on public.invitations for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "본인 명의로만 생성"
  on public.invitations for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "소유자만 수정"
  on public.invitations for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "소유자만 삭제"
  on public.invitations for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- guestbook_entries ---------------------------------------------------------
create policy "공개 청첩장의 방명록은 누구나 조회"
  on public.guestbook_entries for select to anon, authenticated
  using (
    not is_hidden
    and public.invitation_accepts(invitation_id, 'guestbook')
  );

create policy "소유자는 숨긴 글까지 조회"
  on public.guestbook_entries for select to authenticated
  using (public.owns_invitation(invitation_id));

create policy "방명록이 켜진 공개 청첩장에만 작성"
  on public.guestbook_entries for insert to anon, authenticated
  with check (
    public.invitation_accepts(invitation_id, 'guestbook')
    and is_hidden = false
  );

create policy "소유자만 방명록 숨김 처리"
  on public.guestbook_entries for update to authenticated
  using (public.owns_invitation(invitation_id))
  with check (public.owns_invitation(invitation_id));

create policy "소유자만 방명록 삭제"
  on public.guestbook_entries for delete to authenticated
  using (public.owns_invitation(invitation_id));

-- rsvps ---------------------------------------------------------------------
-- 하객은 제출만 가능하고 조회는 불가능하다.
-- 따라서 앱에서 .insert().select() 를 쓰면 안 된다 (RLS 위반으로 실패).
create policy "RSVP 가 켜진 공개 청첩장에만 제출"
  on public.rsvps for insert to anon, authenticated
  with check (public.invitation_accepts(invitation_id, 'rsvp'));

create policy "소유자만 RSVP 조회"
  on public.rsvps for select to authenticated
  using (public.owns_invitation(invitation_id));

create policy "소유자만 RSVP 삭제"
  on public.rsvps for delete to authenticated
  using (public.owns_invitation(invitation_id));

-- ---------------------------------------------------------------------------
-- Storage : 청첩장 이미지
-- 경로 규칙 = {auth.uid()}/{invitation_id}/{filename}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('invitation-images', 'invitation-images', true)
on conflict (id) do nothing;

create policy "청첩장 이미지는 누구나 조회"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'invitation-images');

create policy "본인 폴더에만 업로드"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'invitation-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "본인 폴더만 삭제"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'invitation-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
