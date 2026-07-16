"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** open redirect 방지: 내부 경로만 허용 */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function toLogin(params: Record<string, string>): never {
  redirect(`/login?${new URLSearchParams(params)}`);
}

const OAUTH_PROVIDERS = ["kakao", "google"] as const;
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

function isOAuthProvider(value: unknown): value is OAuthProvider {
  return OAUTH_PROVIDERS.includes(value as OAuthProvider);
}

export async function signInWithOAuth(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const provider = formData.get("provider");
  if (!isOAuthProvider(provider)) {
    toLogin({ error: "지원하지 않는 로그인 방식입니다.", next });
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    toLogin({
      error: "소셜 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.",
      next,
    });
  }

  redirect(data.url);
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
