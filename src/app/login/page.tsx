import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login, signup } from "./actions";

export const metadata: Metadata = {
  title: "로그인",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, next } = await searchParams;

  // 이미 로그인돼 있으면 폼을 보여줄 이유가 없다
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold text-stone-900">
          웨드페이퍼
        </h1>
        <p className="mb-8 text-center text-sm text-stone-500">
          우리 둘의 이야기를 담은 모바일 청첩장
        </p>

        <form className="space-y-3">
          <input type="hidden" name="next" value={next ?? "/dashboard"} />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">
              이메일
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">
              비밀번호
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="6자 이상"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <button
            formAction={login}
            className="w-full rounded-lg bg-rose-500 py-2.5 font-medium text-white transition hover:bg-rose-600"
          >
            로그인
          </button>
          <button
            formAction={signup}
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 font-medium text-stone-700 transition hover:bg-stone-100"
          >
            이메일로 회원가입
          </button>
        </form>
      </div>
    </main>
  );
}
