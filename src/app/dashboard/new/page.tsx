import type { Metadata } from "next";
import Link from "next/link";
import { createInvitation } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "새 청첩장",
};

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

interface NewInvitationPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewInvitationPage({
  searchParams,
}: NewInvitationPageProps) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← 내 청첩장
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-stone-900">
          새 청첩장 만들기
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          기본 정보만 입력하면 시작할 수 있어요. 나머지는 나중에 채워도 됩니다.
        </p>
      </header>

      <form action={createInvitation} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>신랑 이름</span>
            <input
              name="groom_name"
              required
              maxLength={20}
              placeholder="김민준"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>신부 이름</span>
            <input
              name="bride_name"
              required
              maxLength={20}
              placeholder="이서연"
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>청첩장 주소</span>
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-sm text-stone-400">
              wedpaper.com/i/
            </span>
            <input
              name="slug"
              required
              minLength={3}
              maxLength={50}
              pattern="[a-z0-9][a-z0-9\-]{1,48}[a-z0-9]"
              placeholder="minjun-seoyeon"
              className={inputClass}
            />
          </div>
          <span className="mt-1 block text-xs text-stone-400">
            영문 소문자·숫자·하이픈(-)만, 3~50자. 나중에 바꿀 수 있어요.
          </span>
        </label>

        <label className="block">
          <span className={labelClass}>
            예식 일시 <span className="font-normal text-stone-400">(선택)</span>
          </span>
          <input name="wedding_at" type="datetime-local" className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className={labelClass}>
              예식장 이름{" "}
              <span className="font-normal text-stone-400">(선택)</span>
            </span>
            <input
              name="venue_name"
              maxLength={50}
              placeholder="메종 드 플뢰르 2층 그랜드홀"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>
              예식장 주소{" "}
              <span className="font-normal text-stone-400">(선택)</span>
            </span>
            <input
              name="venue_address"
              maxLength={100}
              placeholder="서울시 강남구 ..."
              className={inputClass}
            />
          </label>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button className="w-full rounded-lg bg-rose-500 py-3 font-medium text-white transition hover:bg-rose-600">
          만들기
        </button>
      </form>
    </main>
  );
}
