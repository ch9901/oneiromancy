import { z } from "zod";

/** DB 의 invitations_slug_format CHECK 제약과 동일하게 유지할 것 */
export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export const invitationSchema = z.object({
  groom_name: z.string().trim().min(1, "신랑 이름을 입력해주세요.").max(20),
  bride_name: z.string().trim().min(1, "신부 이름을 입력해주세요.").max(20),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      SLUG_REGEX,
      "주소는 영문 소문자·숫자·하이픈만 사용해 3~50자로 입력해주세요.",
    ),
  wedding_at: z.string().trim().optional(),
  venue_name: z.string().trim().max(50).optional(),
  venue_address: z.string().trim().max(100).optional(),
  greeting: z.string().trim().max(500).optional(),
});

/**
 * <input type="datetime-local"> 값("2026-10-24T12:00")을
 * KST 오프셋이 붙은 ISO 문자열로 바꾼다. 빈 값이면 null.
 */
export function toKstIso(value: string | undefined): string | null {
  if (!value) return null;
  return `${value}:00+09:00`;
}

/** 저장된 timestamptz 를 datetime-local 입력값(KST 기준)으로 변환 */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  return formatted.replace(" ", "T");
}

/** 공개 페이지 등에 보여줄 한국어 일시 문자열 */
export function formatWeddingAt(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(iso));
}

/** Postgres 에러 코드를 사용자 메시지로 변환 */
export function slugErrorMessage(code: string | undefined): string | null {
  if (code === "23505") return "이미 사용 중인 주소입니다. 다른 주소를 골라주세요.";
  if (code === "23514") return "사용할 수 없는 주소입니다. 다른 주소를 골라주세요.";
  return null;
}
