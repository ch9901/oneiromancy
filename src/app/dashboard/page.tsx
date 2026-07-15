import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "내 청첩장",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy 가 먼저 거르지만, 방어적으로 한 번 더 확인한다
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg bg-stone-50 px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">내 청첩장</h1>
        <form action={signout}>
          <button className="text-sm text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline">
            로그아웃
          </button>
        </form>
      </header>

      <p className="mb-6 text-sm text-stone-500">{user.email} 님, 환영합니다.</p>

      <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
        <p className="mb-1 font-medium text-stone-700">
          아직 만든 청첩장이 없어요
        </p>
        <p className="text-sm text-stone-500">
          청첩장 만들기 기능이 곧 여기에 들어갑니다.
        </p>
      </div>
    </main>
  );
}
