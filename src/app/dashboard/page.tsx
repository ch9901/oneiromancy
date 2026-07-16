import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";
import { formatWeddingAt } from "@/lib/datetime";
import type { Invitation } from "@/lib/types";

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

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });
  const invitations = (data ?? []) as Invitation[];

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">내 청첩장</h1>
        <form action={signout}>
          <button className="text-sm text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline">
            로그아웃
          </button>
        </form>
      </header>

      <Link
        href="/dashboard/new"
        className="mb-6 block rounded-xl bg-rose-500 py-3 text-center font-medium text-white transition hover:bg-rose-600"
      >
        + 새 청첩장 만들기
      </Link>

      {invitations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="mb-1 font-medium text-stone-700">
            아직 만든 청첩장이 없어요
          </p>
          <p className="text-sm text-stone-500">
            위 버튼을 눌러 첫 청첩장을 만들어보세요.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {invitations.map((invitation) => (
            <li key={invitation.id}>
              <Link
                href={`/dashboard/${invitation.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-5 transition hover:border-rose-300"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-stone-900">
                    {invitation.groom_name} ♥ {invitation.bride_name}
                  </span>
                  <span
                    className={
                      invitation.status === "published"
                        ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600"
                        : "rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500"
                    }
                  >
                    {invitation.status === "published" ? "발행됨" : "임시저장"}
                  </span>
                </div>
                <p className="text-sm text-stone-500">
                  {formatWeddingAt(invitation.wedding_at) ?? "예식 일시 미정"}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  /i/{invitation.slug}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
