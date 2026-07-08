import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** 로그인이 필요한 경로 */
const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * 매 요청마다 Supabase 세션 쿠키를 갱신한다.
 *
 * 주의: 반드시 여기서 만든 `response` 객체를 그대로 반환해야 한다.
 * 새 NextResponse 를 만들어 반환하면 갱신된 세션 쿠키가 유실되어
 * 사용자가 무작위로 로그아웃된다.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getSession() 이 아니라 getUser() 를 써야 한다.
  // getSession() 은 쿠키를 그대로 신뢰하므로 위조 가능하다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user && needsAuth) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
