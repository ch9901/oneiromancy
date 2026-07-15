import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login, signInWithOAuth, signup } from "./actions";

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

        <form action={signInWithOAuth} className="space-y-2.5">
          <input type="hidden" name="next" value={next ?? "/dashboard"} />
          <button
            name="provider"
            value="kakao"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-2.5 font-medium text-[#191919] transition hover:brightness-95"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.85 5.26 4.64 6.66-.2.75-.75 2.72-.86 3.14-.13.52.19.51.4.37.17-.11 2.62-1.78 3.68-2.5.69.1 1.4.16 2.14.16 5.52 0 10-3.54 10-7.83S17.52 3 12 3z" />
            </svg>
            카카오로 시작하기
          </button>
          <button
            name="provider"
            value="google"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white py-2.5 font-medium text-stone-700 transition hover:bg-stone-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            Google로 시작하기
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-stone-200" />
          <span className="text-xs text-stone-400">또는 이메일로</span>
          <div className="h-px flex-1 bg-stone-200" />
        </div>

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
