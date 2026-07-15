"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

/** open redirect 방지: 내부 경로만 허용 */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function toLogin(params: Record<string, string>): never {
  redirect(`/login?${new URLSearchParams(params)}`);
}

export async function login(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    toLogin({ error: parsed.error.issues[0].message, next });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "이메일 또는 비밀번호가 올바르지 않습니다."
        : error.code === "email_not_confirmed"
          ? "이메일 인증이 완료되지 않았습니다. 받은편지함을 확인해주세요."
          : "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
    toLogin({ error: message, next });
  }

  redirect(next);
}

export async function signup(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    toLogin({ error: parsed.error.issues[0].message, next });
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const message =
      error.code === "user_already_exists"
        ? "이미 가입된 이메일입니다. 로그인해주세요."
        : error.code === "weak_password"
          ? "비밀번호가 너무 짧거나 단순합니다."
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
    toLogin({ error: message, next });
  }

  // 이메일 확인이 꺼져 있으면 세션이 바로 생긴다 → 곧장 입장
  if (data.session) {
    redirect(next);
  }

  toLogin({
    message: "확인 메일을 보냈습니다. 받은편지함에서 인증 링크를 눌러주세요.",
    next,
  });
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
