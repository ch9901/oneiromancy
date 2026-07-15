import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <h1 className="mb-3 text-3xl font-semibold text-stone-900">웨드페이퍼</h1>
      <p className="mb-8 text-stone-500">
        우리 둘의 이야기를 담은 모바일 청첩장
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-rose-500 px-6 py-3 font-medium text-white transition hover:bg-rose-600"
      >
        시작하기
      </Link>
    </main>
  );
}
