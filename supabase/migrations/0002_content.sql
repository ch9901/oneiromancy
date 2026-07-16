-- 청첩장 섹션 구조 도입
-- 섹션(글귀, 가족 정보, 계좌번호, 타임라인 등)은 순서 변경이 필요하므로
-- 컬럼이 아니라 순서 있는 jsonb 배열로 저장한다.
-- Supabase 대시보드 > SQL Editor 에서 실행할 것.

alter table public.invitations
  add column if not exists content jsonb not null default '{}'::jsonb;
