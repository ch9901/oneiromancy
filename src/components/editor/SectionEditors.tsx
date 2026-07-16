"use client";

import type { ReactNode } from "react";
import type { Section, SectionData, WeddingSettings } from "@/lib/sections";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100";
const labelClass = "mb-1 block text-xs font-medium text-stone-500";
const addButtonClass =
  "w-full rounded-lg border border-dashed border-stone-300 py-2 text-sm text-stone-500 transition hover:border-rose-300 hover:text-rose-500";
const removeButtonClass =
  "shrink-0 self-start rounded-md px-2 py-1 text-xs text-stone-400 transition hover:bg-red-50 hover:text-red-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

/** 목록형 데이터 편집 공통 래퍼 */
function ItemList<T>({
  items,
  onChange,
  makeItem,
  addLabel,
  max,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeItem: () => T;
  addLabel: string;
  max: number;
  render: (item: T, set: (next: T) => void) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 rounded-lg border border-stone-200 p-3">
          <div className="flex-1 space-y-2">
            {render(item, (next) =>
              onChange(items.map((it, j) => (j === i ? next : it))),
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className={removeButtonClass}
          >
            삭제
          </button>
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, makeItem()])}
          className={addButtonClass}
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-rose-500"
      />
      {label}
    </label>
  );
}

/* ---------- 혼주(부모) 편집 공통 ---------- */

type ParentInfo = SectionData<"family">["groom"];

function ParentEditor({
  title,
  value,
  onChange,
  withPhone,
  withRelation,
}: {
  title: string;
  value: ParentInfo;
  onChange: (v: ParentInfo) => void;
  withPhone?: boolean;
  withRelation?: boolean;
}) {
  const setPerson = (key: "father" | "mother", patch: Partial<{ name: string; phone: string }>) =>
    onChange({ ...value, [key]: { ...value[key], ...patch } });

  return (
    <div className="rounded-lg border border-stone-200 p-3">
      <p className="mb-2 text-xs font-medium text-stone-500">{title}</p>
      <div className="space-y-2">
        {(["father", "mother"] as const).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-xs text-stone-400">
              {key === "father" ? "아버지" : "어머니"}
            </span>
            <input
              value={value[key]?.name ?? ""}
              onChange={(e) => setPerson(key, { name: e.target.value })}
              placeholder="성함"
              maxLength={20}
              className={inputClass}
            />
            {withPhone && (
              <input
                value={value[key]?.phone ?? ""}
                onChange={(e) => setPerson(key, { phone: e.target.value })}
                placeholder="연락처"
                maxLength={20}
                className={inputClass}
              />
            )}
            <Toggle
              label="故"
              checked={Boolean(value[key === "father" ? "fatherDeceased" : "motherDeceased"])}
              onChange={(v) =>
                onChange({
                  ...value,
                  [key === "father" ? "fatherDeceased" : "motherDeceased"]: v,
                })
              }
            />
          </div>
        ))}
        {withRelation && (
          <Field label="관계 (예: 장남, 차녀)">
            <input
              value={value.relation ?? ""}
              onChange={(e) => onChange({ ...value, relation: e.target.value })}
              maxLength={10}
              className={inputClass}
            />
          </Field>
        )}
      </div>
    </div>
  );
}

/* ---------- 섹션별 편집 패널 ---------- */

export function SectionEditor({
  section,
  onChange,
  labels,
}: {
  section: Section;
  onChange: (data: Section["data"]) => void;
  labels: WeddingSettings["labels"];
}) {
  switch (section.type) {
    case "main": {
      const data = section.data;
      return (
        <div className="space-y-3">
          <Field label="상단 문구">
            <input
              value={data.tagline}
              onChange={(e) => onChange({ ...data, tagline: e.target.value })}
              maxLength={40}
              className={inputClass}
            />
          </Field>
          <Toggle label="예식 일시 표시" checked={data.showDate} onChange={(v) => onChange({ ...data, showDate: v })} />
          <Toggle label="예식장 이름 표시" checked={data.showVenue} onChange={(v) => onChange({ ...data, showVenue: v })} />
        </div>
      );
    }

    case "family": {
      const data = section.data;
      return (
        <div className="space-y-3">
          <ParentEditor title={labels.groomParents} value={data.groom} onChange={(v) => onChange({ ...data, groom: v })} withRelation />
          <ParentEditor title={labels.brideParents} value={data.bride} onChange={(v) => onChange({ ...data, bride: v })} withRelation />
        </div>
      );
    }

    case "quote": {
      const data = section.data;
      return (
        <div className="space-y-3">
          <Field label="글귀">
            <textarea
              value={data.text}
              onChange={(e) => onChange({ ...data, text: e.target.value })}
              rows={4}
              maxLength={300}
              placeholder={"사랑은 소유가 아니라 동행임을\n두 사람이 보여줍니다"}
              className={inputClass}
            />
          </Field>
          <Field label="출처 (선택)">
            <input
              value={data.source ?? ""}
              onChange={(e) => onChange({ ...data, source: e.target.value })}
              maxLength={50}
              className={inputClass}
            />
          </Field>
        </div>
      );
    }

    case "greeting": {
      const data = section.data;
      return (
        <div className="space-y-3">
          <Field label="제목">
            <input
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              maxLength={30}
              className={inputClass}
            />
          </Field>
          <Field label="인사말">
            <textarea
              value={data.text}
              onChange={(e) => onChange({ ...data, text: e.target.value })}
              rows={6}
              maxLength={1000}
              className={inputClass}
            />
          </Field>
        </div>
      );
    }

    case "calendar":
      return (
        <Toggle
          label="D-day 문구 표시"
          checked={section.data.showDday}
          onChange={(v) => onChange({ ...section.data, showDday: v })}
        />
      );

    case "profiles": {
      const data = section.data;
      return (
        <div className="space-y-3">
          <Field label={`${labels.groom} 소개`}>
            <textarea
              value={data.groomIntro}
              onChange={(e) => onChange({ ...data, groomIntro: e.target.value })}
              rows={3}
              maxLength={200}
              className={inputClass}
            />
          </Field>
          <Field label={`${labels.bride} 소개`}>
            <textarea
              value={data.brideIntro}
              onChange={(e) => onChange({ ...data, brideIntro: e.target.value })}
              rows={3}
              maxLength={200}
              className={inputClass}
            />
          </Field>
        </div>
      );
    }

    case "contacts": {
      const data = section.data;
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label={`${labels.groom} 연락처`}>
            <input
              value={data.groomPhone}
              onChange={(e) => onChange({ ...data, groomPhone: e.target.value })}
              placeholder="010-1234-5678"
              maxLength={20}
              className={inputClass}
            />
          </Field>
          <Field label={`${labels.bride} 연락처`}>
            <input
              value={data.bridePhone}
              onChange={(e) => onChange({ ...data, bridePhone: e.target.value })}
              placeholder="010-1234-5678"
              maxLength={20}
              className={inputClass}
            />
          </Field>
        </div>
      );
    }

    case "parentContacts": {
      const data = section.data;
      return (
        <div className="space-y-3">
          <ParentEditor title={labels.groomParents} value={data.groom} onChange={(v) => onChange({ ...data, groom: v })} withPhone />
          <ParentEditor title={labels.brideParents} value={data.bride} onChange={(v) => onChange({ ...data, bride: v })} withPhone />
        </div>
      );
    }

    case "timeline":
      return (
        <ItemList
          items={section.data.items}
          onChange={(items) => onChange({ items })}
          makeItem={() => ({ date: "", title: "", text: "" })}
          addLabel="이야기 추가"
          max={20}
          render={(item, set) => (
            <>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <input value={item.date} onChange={(e) => set({ ...item, date: e.target.value })} placeholder="2020.05" maxLength={20} className={inputClass} />
                <input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="처음 만난 날" maxLength={40} className={inputClass} />
              </div>
              <input value={item.text} onChange={(e) => set({ ...item, text: e.target.value })} placeholder="설명 (선택)" maxLength={200} className={inputClass} />
            </>
          )}
        />
      );

    case "interview":
      return (
        <ItemList
          items={section.data.items}
          onChange={(items) => onChange({ items })}
          makeItem={() => ({ q: "", a: "" })}
          addLabel="질문 추가"
          max={10}
          render={(item, set) => (
            <>
              <input value={item.q} onChange={(e) => set({ ...item, q: e.target.value })} placeholder="질문" maxLength={100} className={inputClass} />
              <textarea value={item.a} onChange={(e) => set({ ...item, a: e.target.value })} placeholder="답변" rows={2} maxLength={500} className={inputClass} />
            </>
          )}
        />
      );

    case "venue":
      return (
        <Field label="추가 안내 (선택)">
          <textarea
            value={section.data.note ?? ""}
            onChange={(e) => onChange({ note: e.target.value })}
            rows={2}
            maxLength={200}
            placeholder="예: 주차장이 협소하니 대중교통을 이용해주세요"
            className={inputClass}
          />
        </Field>
      );

    case "transport":
      return (
        <ItemList
          items={section.data.items}
          onChange={(items) => onChange({ items })}
          makeItem={() => ({ label: "", text: "" })}
          addLabel="교통편 추가"
          max={10}
          render={(item, set) => (
            <>
              <input value={item.label} onChange={(e) => set({ ...item, label: e.target.value })} placeholder="지하철 / 버스 / 주차" maxLength={20} className={inputClass} />
              <textarea value={item.text} onChange={(e) => set({ ...item, text: e.target.value })} placeholder="2호선 강남역 3번 출구 도보 5분" rows={2} maxLength={200} className={inputClass} />
            </>
          )}
        />
      );

    case "notice": {
      const data = section.data;
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["card", "box"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onChange({ ...data, style })}
                className={`flex-1 rounded-lg border py-2 text-sm transition ${
                  data.style === style
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-stone-200 text-stone-500 hover:bg-stone-50"
                }`}
              >
                {style === "card" ? "카드형" : "박스형"}
              </button>
            ))}
          </div>
          <ItemList
            items={data.items}
            onChange={(items) => onChange({ ...data, items })}
            makeItem={() => ({ title: "", text: "" })}
            addLabel="안내문 추가"
            max={10}
            render={(item, set) => (
              <>
                <input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="제목 (예: 화환 안내)" maxLength={40} className={inputClass} />
                <textarea value={item.text} onChange={(e) => set({ ...item, text: e.target.value })} placeholder="내용" rows={2} maxLength={500} className={inputClass} />
              </>
            )}
          />
        </div>
      );
    }

    case "rsvp":
    case "guestbook":
      return (
        <Field label="안내 문구 (선택)">
          <textarea
            value={section.data.intro ?? ""}
            onChange={(e) => onChange({ intro: e.target.value })}
            rows={2}
            maxLength={200}
            className={inputClass}
          />
        </Field>
      );

    case "accounts":
      return (
        <ItemList
          items={section.data.groups}
          onChange={(groups) => onChange({ groups })}
          makeItem={() => ({ label: "", accounts: [] })}
          addLabel="그룹 추가 (예: 신랑측)"
          max={4}
          render={(group, setGroup) => (
            <>
              <input
                value={group.label}
                onChange={(e) => setGroup({ ...group, label: e.target.value })}
                placeholder="그룹 이름 (신랑측 / 신부측)"
                maxLength={20}
                className={inputClass}
              />
              <ItemList
                items={group.accounts}
                onChange={(accounts) => setGroup({ ...group, accounts })}
                makeItem={() => ({ bank: "", number: "", holder: "" })}
                addLabel="계좌 추가"
                max={6}
                render={(account, setAccount) => (
                  <div className="grid grid-cols-[6rem_1fr_6rem] gap-2">
                    <input value={account.bank} onChange={(e) => setAccount({ ...account, bank: e.target.value })} placeholder="은행" maxLength={20} className={inputClass} />
                    <input value={account.number} onChange={(e) => setAccount({ ...account, number: e.target.value })} placeholder="계좌번호" maxLength={30} className={inputClass} />
                    <input value={account.holder} onChange={(e) => setAccount({ ...account, holder: e.target.value })} placeholder="예금주" maxLength={20} className={inputClass} />
                  </div>
                )}
              />
            </>
          )}
        />
      );

    case "together": {
      const data = section.data;
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="처음 만난 날">
            <input
              type="date"
              value={data.since}
              onChange={(e) => onChange({ ...data, since: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="문구">
            <input
              value={data.text}
              onChange={(e) => onChange({ ...data, text: e.target.value })}
              maxLength={100}
              className={inputClass}
            />
          </Field>
        </div>
      );
    }

    case "ddayInfo":
      return (
        <ItemList
          items={section.data.items}
          onChange={(items) => onChange({ items })}
          makeItem={() => ({ title: "", text: "" })}
          addLabel="안내 추가"
          max={10}
          render={(item, set) => (
            <>
              <input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="제목 (예: 포토부스)" maxLength={40} className={inputClass} />
              <textarea value={item.text} onChange={(e) => set({ ...item, text: e.target.value })} placeholder="내용" rows={2} maxLength={300} className={inputClass} />
            </>
          )}
        />
      );

    case "ending":
      return (
        <Field label="마무리 문구">
          <textarea
            value={section.data.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={4}
            maxLength={300}
            placeholder={"저희 두 사람의 시작을\n함께해 주셔서 감사합니다"}
            className={inputClass}
          />
        </Field>
      );
  }
}
