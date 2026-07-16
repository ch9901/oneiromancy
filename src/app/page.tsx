import Link from "next/link";

const FEATURES = [
  {
    icon: "💌",
    title: "나만의 청첩장",
    description:
      "사진과 인사말, 예식 정보를 담아 두 사람만의 청첩장을 만들어보세요. 링크 하나로 완성됩니다.",
  },
  {
    icon: "🗺️",
    title: "오시는 길 안내",
    description:
      "예식장 위치와 주소를 지도와 함께 안내합니다. 하객들이 헤매지 않아요.",
  },
  {
    icon: "📝",
    title: "방명록",
    description:
      "하객들이 남긴 축하 인사를 청첩장에서 바로 확인하세요. 결혼식이 끝나도 추억으로 남습니다.",
  },
  {
    icon: "✅",
    title: "참석 여부 회신",
    description:
      "참석 인원과 식사 여부를 미리 받아 집계합니다. 전화 돌릴 필요 없이 한눈에.",
  },
  {
    icon: "💬",
    title: "카카오톡 공유",
    description:
      "카카오톡으로 보내면 예쁜 미리보기와 함께 전달됩니다. 모시는 마음이 그대로.",
  },
  {
    icon: "🔧",
    title: "원하는 기능만",
    description:
      "방명록, 참석 회신 등 필요한 기능만 골라 켜고 끌 수 있습니다. 청첩장은 심플하게.",
  },
];

const STEPS = [
  { step: "1", title: "간편 가입", description: "카카오 또는 구글 계정으로 3초 만에 시작해요." },
  { step: "2", title: "정보 입력", description: "두 사람의 이름과 예식 일시, 장소, 사진을 채워요." },
  { step: "3", title: "링크 공유", description: "완성된 청첩장 링크를 카카오톡으로 보내면 끝." },
];

export default function Home() {
  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900">
      {/* 헤더 */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <span className="text-lg font-semibold">웨드페이퍼</span>
        <Link
          href="/login"
          className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
        >
          로그인
        </Link>
      </header>

      {/* 히어로 */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-12 px-5 pb-20 pt-12 md:flex-row md:justify-between md:pt-20">
        <div className="max-w-xl text-center md:text-left">
          <p className="mb-3 text-sm font-medium text-rose-500">
            모바일 청첩장 서비스
          </p>
          <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
            우리 둘의 이야기를 담은
            <br />
            모바일 청첩장
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-stone-500">
            사진, 오시는 길, 방명록, 참석 회신까지.
            <br />
            소중한 분들을 모시는 마음을 링크 하나에 담아보세요.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
          >
            무료로 만들기
          </Link>
        </div>

        {/* 폰 목업 */}
        <div className="w-64 shrink-0 rounded-[2.2rem] border-8 border-stone-800 bg-white p-5 shadow-2xl">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-[10px] tracking-[0.3em] text-stone-400">
              WEDDING INVITATION
            </p>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-rose-50 text-4xl">
              💐
            </div>
            <p className="mt-2 font-serif text-lg">민준 <span className="text-rose-400">&</span> 서연</p>
            <p className="text-xs leading-relaxed text-stone-500">
              2026년 10월 24일 토요일 낮 12시
              <br />
              메종 드 플뢰르
            </p>
            <div className="mt-3 w-full rounded-lg bg-stone-100 py-2 text-xs text-stone-500">
              💬 축하 인사 남기기
            </div>
            <div className="w-full rounded-lg bg-rose-500 py-2 text-xs font-medium text-white">
              참석 여부 알리기
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="border-t border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="mb-3 text-center text-3xl font-bold">
            필요한 건 다 있어요
          </h2>
          <p className="mb-12 text-center text-stone-500">
            종이 청첩장이 담지 못하는 것까지, 웨드페이퍼로.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-stone-100 bg-stone-50 p-6"
              >
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-stone-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="mb-12 text-center text-3xl font-bold">
            3분이면 충분해요
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="border-t border-stone-200 bg-white py-20 text-center">
        <div className="mx-auto max-w-xl px-5">
          <h2 className="mb-4 text-3xl font-bold">
            두 사람의 시작,
            <br />
            웨드페이퍼와 함께하세요
          </h2>
          <p className="mb-8 text-stone-500">
            지금 만들면 바로 공유할 수 있어요.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
          >
            무료로 만들기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-400">
        © 2026 웨드페이퍼
      </footer>
    </div>
  );
}
