/**
 * 예식 일시 변환 유틸.
 * 서비스는 한국 예식만 대상이므로 KST(Asia/Seoul) 고정이다.
 * (zod 등 서버 의존성이 없어 클라이언트 컴포넌트에서도 쓸 수 있다)
 */

/** "2026-10-24T12:00" (datetime-local 형식) → KST 오프셋 ISO. 빈 값이면 null */
export function toKstIso(value: string | undefined): string | null {
  if (!value) return null;
  return `${value}:00+09:00`;
}

/** 저장된 timestamptz → datetime-local 입력값(KST 기준) */
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
