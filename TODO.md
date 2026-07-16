# 웨드페이퍼 TODO

> 2026-07-16 기준. 완료 항목은 지우지 말고 체크 표시로 남길 것.

## 완료

- [x] Supabase 기반 (스키마 + RLS 멀티테넌트, `supabase/migrations/`)
- [x] 소셜 로그인 — 카카오 + 구글 (이메일 로그인 제거, 네이버는 Supabase 미지원으로 보류)
- [x] 랜딩 페이지
- [x] 청첩장 CRUD + 공개 페이지 `/i/[slug]` (카톡 공유용 OG 태그)
- [x] 에디터 — 좌측 실시간 미리보기 + 우측 아코디언 (salondeletter.com 참고)
- [x] 예식 일시 달력(react-day-picker) / 주소 검색(다음 우편번호)
- [x] 섹션 구조 (`invitations.content` jsonb, `src/lib/sections.ts`) — 텍스트 섹션 19종
- [x] 섹션 드래그앤드롭 순서변경(dnd-kit), 온오프, 신랑·신부·혼주 명칭변경
- [x] 마이그레이션 0001, 0002 프로덕션 적용됨

## 다음 작업 (우선순위 순)

- [ ] **방명록 실제 동작**
  - 공개 페이지에서 하객 작성 폼 (이름 + 메시지 + 삭제용 4자리 비밀번호)
  - 목록 표시 + 페이지네이션
  - 에디터/대시보드에서 신랑신부가 숨김·삭제
  - DB 테이블·RLS 는 이미 있음 (`guestbook_entries`)
- [ ] **RSVP 실제 동작**
  - 공개 페이지 제출 폼 (신랑측/신부측, 참석 여부, 인원, 식사)
  - 대시보드 집계 화면 (참석 인원 합계)
  - 주의: 하객은 조회 불가 RLS 라 `.insert().select()` 쓰면 실패함
  - DB 테이블·RLS 는 이미 있음 (`rsvps`)
- [ ] **사진 업로드** — Storage 버킷(`invitation-images`)은 이미 있음, 경로 규칙 `{uid}/{invitation_id}/{filename}`
  - 메인 커버 사진 (`cover_image_url` 컬럼 존재)
  - 갤러리 섹션 (새 섹션 타입 추가 — `src/lib/sections.ts` 주석의 4곳 등록 절차 참고)
- [ ] **지도 섹션** — 카카오맵 JS SDK (JavaScript 키는 카카오 콘솔에 이미 발급돼 있음)
- [ ] 영상 섹션 (유튜브 embed)
- [ ] 카카오톡/URL 공유 스타일 커스터마이징 (OG 이미지 = 커버 업로드와 묶어서)
- [ ] 로딩화면, 폰트·스타일 테마, 배경음악
- [ ] 대시보드 목록 UX 개선 (링크 복사 버튼 등)
- [ ] 배포 (Vercel) — `NEXT_PUBLIC_SITE_URL` 교체, 카카오 로그인 redirect 도메인 추가 필요

## 보류 / 결정 필요

- 네이버 로그인 (Supabase 미지원 — 직접 OAuth 구현 필요, 하루 이상 작업)
- 게스트스냅·화환 보내기 (살롱드레터의 외부 제휴 기능 — 대체 서비스 조사 필요)
- 결제 / 요금제

## 참고

- Next 16: `middleware.ts` 대신 `src/proxy.ts` (named export `proxy`)
- 새 섹션 추가 절차: `src/lib/sections.ts` 상단 주석 참고 (스키마/기본값/제목/뷰·에디터 4곳)
- 에디터 검증 패턴: `/dev-editor-preview` 임시 페이지에 목 데이터 — 커밋 전 삭제
- 로컬 개발: `.env.local` 필요 (`.env.example` 참고), 마이그레이션은 Supabase SQL Editor 에서 수동 실행
