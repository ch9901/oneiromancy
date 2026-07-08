import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 부터 `middleware.ts` 는 deprecated 이고 `proxy.ts` 를 쓴다.
// 파일 이름이 proxy 일 때는 `proxy` 라는 이름의 export 를 찾는다.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래를 제외한 모든 경로에서 세션을 갱신한다:
     * - _next/static, _next/image : 빌드 산출물
     * - favicon.ico, 이미지 파일  : 정적 에셋
     *
     * 공개 청첩장(/i/[slug])도 통과시킨다. 방문자가 로그인 상태일 수 있고,
     * 세션 갱신은 익명 사용자에게 아무 부작용이 없다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
