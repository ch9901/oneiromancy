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

/** Postgres 에러 코드를 사용자 메시지로 변환 */
export function slugErrorMessage(code: string | undefined): string | null {
  if (code === "23505") return "이미 사용 중인 주소입니다. 다른 주소를 골라주세요.";
  if (code === "23514") return "사용할 수 없는 주소입니다. 다른 주소를 골라주세요.";
  return null;
}
