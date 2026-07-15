import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * 이메일 인증 링크의 착지점.
 *
 * 두 가지 형태를 모두 처리한다:
 * - token_hash + type : 이메일 템플릿을 `{{ .SiteURL }}/auth/confirm?...` 로
 *   커스터마이징한 경우 (Supabase SSR 권장 방식)
 * - code              : 기본 템플릿({{ .ConfirmationURL }})이 PKCE 코드와 함께
 *   리다이렉트해 준 경우
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/dashboard";
  }

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const params = new URLSearchParams({
    error: "인증 링크가 만료되었거나 잘못되었습니다. 다시 로그인해주세요.",
  });
  return NextResponse.redirect(new URL(`/login?${params}`, request.url));
}
