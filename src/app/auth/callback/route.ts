import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 소셜 로그인(OAuth) 완료 후 Supabase 가 돌려보내는 착지점 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 사용자가 동의 화면에서 취소한 경우 등
  const params = new URLSearchParams({
    error: "소셜 로그인에 실패했습니다. 다시 시도해주세요.",
  });
  return NextResponse.redirect(new URL(`/login?${params}`, request.url));
}
