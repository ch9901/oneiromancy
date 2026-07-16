import type { ReactNode } from "react";
import { formatWeddingAt } from "@/lib/datetime";
import type { Section, SectionData, WeddingSettings } from "@/lib/sections";

/** 섹션 뷰가 공통으로 참조하는 청첩장 핵심 정보 */
export interface SectionContext {
  groomName: string;
  brideName: string;
  weddingAt: string | null;
  venueName: string | null;
  venueAddress: string | null;
  settings: WeddingSettings;
  /** 방명록/RSVP 등 실제 동작 UI 를 붙일 때 쓰는 슬롯 (미리보기에선 비움) */
  slots?: Partial<Record<"guestbook" | "rsvp", ReactNode>>;
}

function SectionTitle({ en, ko }: { en?: string; ko?: string }) {
  return (
    <div className="mb-5">
      {en && (
        <p className="text-[11px] tracking-[0.35em] text-stone-400">{en}</p>
      )}
      {ko && <h2 className="mt-1 font-medium text-stone-700">{ko}</h2>}
    </div>
  );
}

/* ---------- 개별 섹션 뷰 ---------- */

function MainView({ data, ctx }: { data: SectionData<"main">; ctx: SectionContext }) {
  const weddingAt = formatWeddingAt(ctx.weddingAt);
  return (
    <div className="py-6">
      <p className="mb-10 text-[11px] tracking-[0.35em] text-stone-400">
        {data.tagline || "WEDDING INVITATION"}
      </p>
      <div className="mx-auto mb-10 flex h-40 w-40 items-center justify-center rounded-full bg-rose-50 text-5xl">
        💐
      </div>
      <h1 className="mb-2 font-serif text-2xl">
        {ctx.groomName || "신랑"} <span className="text-rose-400">&</span>{" "}
        {ctx.brideName || "신부"}
      </h1>
      <div className="text-sm leading-relaxed text-stone-500">
        {data.showDate && weddingAt && <p>{weddingAt}</p>}
        {data.showVenue && ctx.venueName && <p>{ctx.venueName}</p>}
      </div>
    </div>
  );
}

function personLine(
  name: string | undefined,
  deceased: boolean | undefined,
): string | null {
  if (!name) return null;
  return deceased ? `故 ${name}` : name;
}

function FamilyRow({
  side,
  childName,
  info,
}: {
  side: string;
  childName: string;
  info: SectionData<"family">["groom"];
}) {
  const father = personLine(info.father?.name, info.fatherDeceased);
  const mother = personLine(info.mother?.name, info.motherDeceased);
  if (!father && !mother) return null;
  return (
    <p className="leading-relaxed text-stone-600">
      {[father, mother].filter(Boolean).join(" · ")}
      <span className="text-stone-400">
        의 {info.relation || (side === "groom" ? "아들" : "딸")}
      </span>{" "}
      <span className="font-medium text-stone-800">{childName}</span>
    </p>
  );
}

function FamilyView({ data, ctx }: { data: SectionData<"family">; ctx: SectionContext }) {
  return (
    <div>
      <SectionTitle en="FAMILY" />
      <div className="space-y-2 text-sm">
        <FamilyRow side="groom" childName={ctx.groomName} info={data.groom} />
        <FamilyRow side="bride" childName={ctx.brideName} info={data.bride} />
      </div>
    </div>
  );
}

function QuoteView({ data }: { data: SectionData<"quote"> }) {
  if (!data.text) return null;
  return (
    <div className="px-2">
      <p className="whitespace-pre-line font-serif leading-loose text-stone-600">
        {data.text}
      </p>
      {data.source && (
        <p className="mt-3 text-xs text-stone-400">— {data.source}</p>
      )}
    </div>
  );
}

function GreetingView({ data }: { data: SectionData<"greeting"> }) {
  if (!data.text) return null;
  return (
    <div>
      <SectionTitle en="INVITATION" ko={data.title || undefined} />
      <p className="whitespace-pre-line leading-loose text-stone-600">
        {data.text}
      </p>
    </div>
  );
}

function CalendarView({ data, ctx }: { data: SectionData<"calendar">; ctx: SectionContext }) {
  if (!ctx.weddingAt) return null;
  const target = new Date(ctx.weddingAt);
  const kst = (d: Date) =>
    new Date(d.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const t = kst(target);
  const year = t.getFullYear();
  const month = t.getMonth();
  const day = t.getDate();

  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  const today = kst(new Date());
  today.setHours(0, 0, 0, 0);
  const dday = Math.ceil(
    (new Date(year, month, day).getTime() - today.getTime()) / 86_400_000,
  );

  return (
    <div>
      <SectionTitle en="SAVE THE DATE" />
      <p className="mb-4 font-serif text-lg text-stone-700">
        {year}년 {month + 1}월
      </p>
      <div className="mx-auto grid max-w-[16rem] grid-cols-7 gap-y-2 text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <span key={d} className={i === 0 ? "text-rose-400" : "text-stone-400"}>
            {d}
          </span>
        ))}
        {cells.map((n, i) => (
          <span
            key={i}
            className={
              n === day
                ? "mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-rose-400 font-medium text-white"
                : "text-stone-600"
            }
          >
            {n ?? ""}
          </span>
        ))}
      </div>
      {data.showDday && dday >= 0 && (
        <p className="mt-5 text-sm text-stone-500">
          {ctx.groomName} <span className="text-rose-400">♥</span>{" "}
          {ctx.brideName}의 결혼식이{" "}
          <span className="font-semibold text-rose-500">
            {dday === 0 ? "오늘" : `${dday}일`}
          </span>
          {dday === 0 ? "입니다" : " 남았습니다"}
        </p>
      )}
    </div>
  );
}

function ProfilesView({ data, ctx }: { data: SectionData<"profiles">; ctx: SectionContext }) {
  const items = [
    { label: ctx.settings.labels.groom, name: ctx.groomName, intro: data.groomIntro },
    { label: ctx.settings.labels.bride, name: ctx.brideName, intro: data.brideIntro },
  ].filter((p) => p.intro);
  if (items.length === 0) return null;
  return (
    <div>
      <SectionTitle en="PROFILE" ko="신랑 & 신부를 소개합니다" />
      <div className="space-y-6">
        {items.map((p) => (
          <div key={p.label} className="rounded-2xl bg-white/70 p-5">
            <p className="mb-1 text-xs text-rose-400">{p.label}</p>
            <p className="mb-2 font-medium text-stone-800">{p.name}</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
              {p.intro}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TelButton({ label, name, phone }: { label: string; name?: string; phone?: string }) {
  if (!phone) return null;
  return (
    <a
      href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
      className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"
    >
      <span className="text-sm text-stone-600">
        <span className="mr-2 text-xs text-rose-400">{label}</span>
        {name}
      </span>
      <span aria-hidden>📞</span>
    </a>
  );
}

function ContactsView({ data, ctx }: { data: SectionData<"contacts">; ctx: SectionContext }) {
  if (!data.groomPhone && !data.bridePhone) return null;
  return (
    <div>
      <SectionTitle en="CONTACT" ko="신랑신부에게 연락하기" />
      <div className="space-y-2">
        <TelButton label={ctx.settings.labels.groom} name={ctx.groomName} phone={data.groomPhone} />
        <TelButton label={ctx.settings.labels.bride} name={ctx.brideName} phone={data.bridePhone} />
      </div>
    </div>
  );
}

function ParentContactsView({ data, ctx }: { data: SectionData<"parentContacts">; ctx: SectionContext }) {
  const rows = [
    { group: ctx.settings.labels.groomParents, info: data.groom },
    { group: ctx.settings.labels.brideParents, info: data.bride },
  ].filter(({ info }) => info.father?.phone || info.mother?.phone);
  if (rows.length === 0) return null;
  return (
    <div>
      <SectionTitle en="CONTACT" ko="혼주에게 연락하기" />
      <div className="space-y-4">
        {rows.map(({ group, info }) => (
          <div key={group}>
            <p className="mb-2 text-xs text-stone-400">{group}</p>
            <div className="space-y-2">
              <TelButton label="아버지" name={info.father?.name} phone={info.father?.phone} />
              <TelButton label="어머니" name={info.mother?.name} phone={info.mother?.phone} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ data }: { data: SectionData<"timeline"> }) {
  if (data.items.length === 0) return null;
  return (
    <div>
      <SectionTitle en="OUR STORY" ko="우리의 이야기" />
      <ol className="space-y-5 text-left">
        {data.items.map((item, i) => (
          <li key={i} className="relative pl-6">
            <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-300" />
            <p className="text-xs text-stone-400">{item.date}</p>
            <p className="font-medium text-stone-800">{item.title}</p>
            {item.text && (
              <p className="mt-0.5 text-sm leading-relaxed text-stone-500">
                {item.text}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function InterviewView({ data }: { data: SectionData<"interview"> }) {
  if (data.items.length === 0) return null;
  return (
    <div>
      <SectionTitle en="INTERVIEW" ko="웨딩 인터뷰" />
      <div className="space-y-5 text-left">
        {data.items.map((item, i) => (
          <div key={i}>
            <p className="mb-1 text-sm font-medium text-rose-500">
              Q. {item.q}
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VenueView({ data, ctx }: { data: SectionData<"venue">; ctx: SectionContext }) {
  if (!ctx.venueName && !ctx.venueAddress) return null;
  return (
    <div>
      <SectionTitle en="LOCATION" ko="오시는 길" />
      <p className="text-sm leading-relaxed text-stone-600">
        {ctx.venueName && (
          <span className="block font-medium">{ctx.venueName}</span>
        )}
        {ctx.venueAddress}
      </p>
      {data.note && (
        <p className="mt-2 text-xs leading-relaxed text-stone-400">{data.note}</p>
      )}
    </div>
  );
}

function TransportView({ data }: { data: SectionData<"transport"> }) {
  if (data.items.length === 0) return null;
  return (
    <div>
      <SectionTitle en="TRANSPORT" ko="교통편 안내" />
      <div className="space-y-3 text-left">
        {data.items.map((item, i) => (
          <div key={i}>
            <p className="mb-0.5 text-xs font-medium text-rose-400">
              {item.label}
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticeView({ data }: { data: SectionData<"notice"> }) {
  if (data.items.length === 0) return null;
  return (
    <div>
      <SectionTitle en="INFORMATION" ko="안내 말씀" />
      {data.style === "card" ? (
        <div className="space-y-3">
          {data.items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white/80 p-5 text-left shadow-sm">
              <p className="mb-1 font-medium text-stone-800">{item.title}</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 text-left">
          {data.items.map((item, i) => (
            <div key={i} className="p-4">
              <p className="mb-1 text-sm font-medium text-stone-800">
                {item.title}
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RsvpView({ data, ctx }: { data: SectionData<"rsvp">; ctx: SectionContext }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="mb-2 font-medium">참석 여부 회신</h2>
      {data.intro && (
        <p className="mb-3 whitespace-pre-line text-sm text-stone-500">
          {data.intro}
        </p>
      )}
      {ctx.slots?.rsvp ?? (
        <p className="text-sm text-stone-400">곧 참석 여부를 알릴 수 있어요.</p>
      )}
    </div>
  );
}

function AccountsView({ data }: { data: SectionData<"accounts"> }) {
  const groups = data.groups.filter((g) => g.accounts.length > 0);
  if (groups.length === 0) return null;
  return (
    <div>
      <SectionTitle en="ACCOUNT" ko="마음 전하실 곳" />
      <div className="space-y-4">
        {groups.map((group, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-white text-left">
            <p className="border-b border-stone-100 px-4 py-2.5 text-xs font-medium text-stone-500">
              {group.label}
            </p>
            <div className="divide-y divide-stone-100">
              {group.accounts.map((account, j) => (
                <div key={j} className="px-4 py-3 text-sm">
                  <p className="text-stone-800">
                    {account.bank} {account.number}
                  </p>
                  <p className="text-xs text-stone-400">{account.holder}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuestbookView({ data, ctx }: { data: SectionData<"guestbook">; ctx: SectionContext }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="mb-2 font-medium">방명록</h2>
      {data.intro && (
        <p className="mb-3 whitespace-pre-line text-sm text-stone-500">
          {data.intro}
        </p>
      )}
      {ctx.slots?.guestbook ?? (
        <p className="text-sm text-stone-400">곧 축하 인사를 남길 수 있어요.</p>
      )}
    </div>
  );
}

function TogetherView({ data }: { data: SectionData<"together"> }) {
  if (!data.since) return null;
  const start = new Date(`${data.since}T00:00:00+09:00`);
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1;
  if (days < 1) return null;
  return (
    <div>
      <SectionTitle en="TOGETHER" />
      <p className="text-sm text-stone-500">{data.text || "우리가 함께한 시간"}</p>
      <p className="mt-2 font-serif text-3xl text-rose-500">{days.toLocaleString()}일</p>
    </div>
  );
}

function DdayInfoView({ data }: { data: SectionData<"ddayInfo"> }) {
  if (data.items.length === 0) return null;
  return (
    <div>
      <SectionTitle en="D-DAY" ko="예식 당일 안내" />
      <div className="space-y-3 text-left">
        {data.items.map((item, i) => (
          <div key={i} className="rounded-2xl bg-white/80 p-5 shadow-sm">
            <p className="mb-1 font-medium text-stone-800">{item.title}</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-500">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EndingView({ data }: { data: SectionData<"ending"> }) {
  if (!data.text) return null;
  return (
    <div className="py-6">
      <p className="whitespace-pre-line font-serif leading-loose text-stone-600">
        {data.text}
      </p>
    </div>
  );
}

/* ---------- 디스패처 ---------- */

export function SectionView({
  section,
  ctx,
}: {
  section: Section;
  ctx: SectionContext;
}) {
  switch (section.type) {
    case "main":
      return <MainView data={section.data} ctx={ctx} />;
    case "family":
      return <FamilyView data={section.data} ctx={ctx} />;
    case "quote":
      return <QuoteView data={section.data} />;
    case "greeting":
      return <GreetingView data={section.data} />;
    case "calendar":
      return <CalendarView data={section.data} ctx={ctx} />;
    case "profiles":
      return <ProfilesView data={section.data} ctx={ctx} />;
    case "contacts":
      return <ContactsView data={section.data} ctx={ctx} />;
    case "parentContacts":
      return <ParentContactsView data={section.data} ctx={ctx} />;
    case "timeline":
      return <TimelineView data={section.data} />;
    case "interview":
      return <InterviewView data={section.data} />;
    case "venue":
      return <VenueView data={section.data} ctx={ctx} />;
    case "transport":
      return <TransportView data={section.data} />;
    case "notice":
      return <NoticeView data={section.data} />;
    case "rsvp":
      return <RsvpView data={section.data} ctx={ctx} />;
    case "accounts":
      return <AccountsView data={section.data} />;
    case "guestbook":
      return <GuestbookView data={section.data} ctx={ctx} />;
    case "together":
      return <TogetherView data={section.data} />;
    case "ddayInfo":
      return <DdayInfoView data={section.data} />;
    case "ending":
      return <EndingView data={section.data} />;
  }
}
