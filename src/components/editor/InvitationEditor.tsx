"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { KakaoPostcodeEmbed, type Address } from "react-daum-postcode";
import {
  deleteInvitation,
  setInvitationStatus,
  updateInvitation,
} from "@/app/dashboard/actions";
import { InvitationView } from "@/components/invitation/InvitationView";
import type { Invitation } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

/* ---------- 아코디언 섹션 ---------- */

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  /** 값이 주어지면 헤더 왼쪽에 온오프 스위치가 붙는다 */
  toggle?: { checked: boolean; onChange: (next: boolean) => void };
  children: ReactNode;
}

function Section({ title, defaultOpen = false, toggle, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="flex w-full items-center gap-3 px-4 py-3.5">
        {toggle && (
          <button
            type="button"
            role="switch"
            aria-checked={toggle.checked}
            onClick={() => toggle.onChange(!toggle.checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              toggle.checked ? "bg-rose-400" : "bg-stone-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                toggle.checked ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center justify-between text-left"
        >
          <span className="font-medium text-stone-800">{title}</span>
          <svg
            viewBox="0 0 20 20"
            className={`h-5 w-5 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {open && <div className="border-t border-stone-100 px-4 py-4">{children}</div>}
    </div>
  );
}

/* ---------- 예식 일시 상태 ---------- */

function parseWeddingAt(iso: string | null): {
  date: Date | undefined;
  hour: number;
  minute: number;
} {
  if (!iso) return { date: undefined, hour: 12, minute: 0 };
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso)); // "2026-10-24 12:00"
  const [datePart, timePart] = parts.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return { date: new Date(y, m - 1, d), hour: hh, minute: mm };
}

function toLocalInputValue(date: Date | undefined, hour: number, minute: number): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function hourLabel(hour: number): string {
  if (hour === 0) return "밤 12시";
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return "낮 12시";
  return `오후 ${hour - 12}시`;
}

/* ---------- 에디터 본체 ---------- */

interface InvitationEditorProps {
  invitation: Invitation;
  publicUrl: string;
  error?: string;
  saved?: boolean;
}

export function InvitationEditor({
  invitation,
  publicUrl,
  error,
  saved,
}: InvitationEditorProps) {
  const initial = parseWeddingAt(invitation.wedding_at);

  const [groomName, setGroomName] = useState(invitation.groom_name);
  const [brideName, setBrideName] = useState(invitation.bride_name);
  const [slug, setSlug] = useState(invitation.slug);
  const [date, setDate] = useState<Date | undefined>(initial.date);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [venueName, setVenueName] = useState(invitation.venue_name ?? "");
  const [venueAddress, setVenueAddress] = useState(invitation.venue_address ?? "");
  const [greeting, setGreeting] = useState(invitation.greeting ?? "");
  const [guestbook, setGuestbook] = useState(invitation.features.guestbook);
  const [rsvp, setRsvp] = useState(invitation.features.rsvp);
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  const isPublished = invitation.status === "published";
  const weddingAtValue = toLocalInputValue(date, hour, minute);

  /** 미리보기에 넘길 실시간 데이터 */
  const preview = useMemo(
    () => ({
      groom_name: groomName,
      bride_name: brideName,
      wedding_at: weddingAtValue ? `${weddingAtValue}:00+09:00` : null,
      venue_name: venueName || null,
      venue_address: venueAddress || null,
      greeting: greeting || null,
      features: { guestbook, rsvp },
    }),
    [groomName, brideName, weddingAtValue, venueName, venueAddress, greeting, guestbook, rsvp],
  );

  const handleAddressComplete = (address: Address) => {
    const road = address.roadAddress || address.address;
    const detail = address.buildingName ? ` (${address.buildingName})` : "";
    setVenueAddress(`${road}${detail}`);
    setPostcodeOpen(false);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* ---------- 왼쪽: 실시간 미리보기 ---------- */}
      <div className="hidden lg:block">
        <div className="sticky top-8">
          <div className="mx-auto w-[330px] overflow-hidden rounded-[2.2rem] border-8 border-stone-800 bg-white shadow-2xl">
            <div className="h-[640px] overflow-y-auto">
              <InvitationView invitation={preview} />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-stone-400">
            실시간 미리보기 · 저장해야 반영돼요
          </p>
        </div>
      </div>

      {/* ---------- 오른쪽: 편집 폼 ---------- */}
      <div>
        {/* 발행 상태 */}
        <div className="mb-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span
                className={
                  isPublished
                    ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600"
                    : "rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500"
                }
              >
                {isPublished ? "발행됨" : "임시저장"}
              </span>
              {isPublished ? (
                <a
                  href={publicUrl}
                  target="_blank"
                  className="mt-2 block break-all text-sm text-rose-600 underline underline-offset-2"
                >
                  {publicUrl}
                </a>
              ) : (
                <p className="mt-2 text-sm text-stone-500">
                  발행하면 /i/{slug} 주소로 누구나 볼 수 있어요.
                </p>
              )}
            </div>
            <form action={setInvitationStatus} className="shrink-0">
              <input type="hidden" name="id" value={invitation.id} />
              <input
                type="hidden"
                name="status"
                value={isPublished ? "draft" : "published"}
              />
              <button
                className={
                  isPublished
                    ? "rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                    : "rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                }
              >
                {isPublished ? "발행 취소" : "발행하기"}
              </button>
            </form>
          </div>
        </div>

        <form action={updateInvitation} className="space-y-3">
          <input type="hidden" name="id" value={invitation.id} />
          <input type="hidden" name="wedding_at" value={weddingAtValue} />
          <input type="hidden" name="venue_address" value={venueAddress} />
          {guestbook && <input type="hidden" name="feature_guestbook" value="on" />}
          {rsvp && <input type="hidden" name="feature_rsvp" value="on" />}

          {/* 기본 정보 */}
          <Section title="기본 정보" defaultOpen>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>신랑 이름</span>
                  <input
                    name="groom_name"
                    required
                    maxLength={20}
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>신부 이름</span>
                  <input
                    name="bride_name"
                    required
                    maxLength={20}
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="block">
                <span className={labelClass}>청첩장 주소</span>
                <div className="flex items-center gap-1">
                  <span className="shrink-0 text-sm text-stone-400">wedpaper.com/i/</span>
                  <input
                    name="slug"
                    required
                    minLength={3}
                    maxLength={50}
                    pattern="[a-z0-9][a-z0-9\-]{1,48}[a-z0-9]"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {isPublished && (
                  <span className="mt-1 block text-xs text-amber-600">
                    발행된 상태에서 주소를 바꾸면 이미 공유한 링크가 열리지 않아요.
                  </span>
                )}
              </label>
            </div>
          </Section>

          {/* 예식 일시 */}
          <Section title="예식 일시" defaultOpen>
            <div className="flex flex-col items-center gap-4">
              <DayPicker
                mode="single"
                locale={ko}
                selected={date}
                onSelect={setDate}
                defaultMonth={date}
                style={{ "--rdp-accent-color": "#f43f5e" } as React.CSSProperties}
              />
              <div className="flex w-full items-center gap-2">
                <select
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className={inputClass}
                  aria-label="시"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
                <select
                  value={minute}
                  onChange={(e) => setMinute(Number(e.target.value))}
                  className={inputClass}
                  aria-label="분"
                >
                  {[0, 10, 20, 30, 40, 50].map((m) => (
                    <option key={m} value={m}>
                      {m}분
                    </option>
                  ))}
                </select>
              </div>
              {date && (
                <button
                  type="button"
                  onClick={() => setDate(undefined)}
                  className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-600"
                >
                  날짜 지우기
                </button>
              )}
            </div>
          </Section>

          {/* 예식장 */}
          <Section title="예식장" defaultOpen>
            <div className="space-y-3">
              <label className="block">
                <span className={labelClass}>예식장 이름</span>
                <input
                  name="venue_name"
                  maxLength={50}
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="메종 드 플뢰르 2층 그랜드홀"
                  className={inputClass}
                />
              </label>
              <div>
                <span className={labelClass}>주소</span>
                <div className="flex gap-2">
                  <input
                    value={venueAddress}
                    readOnly
                    placeholder="주소 검색을 눌러주세요"
                    className={`${inputClass} bg-stone-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setPostcodeOpen(true)}
                    className="shrink-0 rounded-lg border border-stone-300 px-4 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                  >
                    주소 검색
                  </button>
                </div>
                {venueAddress && (
                  <button
                    type="button"
                    onClick={() => setVenueAddress("")}
                    className="mt-1 text-xs text-stone-400 underline underline-offset-2 hover:text-stone-600"
                  >
                    주소 지우기
                  </button>
                )}
              </div>
            </div>
          </Section>

          {/* 인사말 */}
          <Section title="인사말">
            <textarea
              name="greeting"
              rows={6}
              maxLength={500}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder={"저희 두 사람이 사랑과 믿음으로\n한 가정을 이루게 되었습니다..."}
              className={inputClass}
            />
          </Section>

          {/* 하객 참여 기능: 헤더에 토글 */}
          <Section
            title="방명록"
            toggle={{ checked: guestbook, onChange: setGuestbook }}
          >
            <p className="text-sm text-stone-500">
              하객이 청첩장에서 축하 인사를 남길 수 있어요. 끄면 방명록 섹션이
              보이지 않아요.
            </p>
          </Section>
          <Section title="참석 여부 회신 (RSVP)" toggle={{ checked: rsvp, onChange: setRsvp }}>
            <p className="text-sm text-stone-500">
              참석 인원과 식사 여부를 미리 받아 집계할 수 있어요.
            </p>
          </Section>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {saved && !error && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              저장했습니다.
            </p>
          )}

          {/* 고정 저장 바 */}
          <div className="sticky bottom-0 -mx-4 border-t border-stone-200 bg-stone-50/90 px-4 py-3 backdrop-blur">
            <button className="w-full rounded-lg bg-stone-800 py-3 font-medium text-white transition hover:bg-stone-900">
              저장
            </button>
          </div>
        </form>

        {/* 삭제 */}
        <form action={deleteInvitation} className="mt-8 border-t border-stone-200 pt-5">
          <input type="hidden" name="id" value={invitation.id} />
          <button className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50">
            청첩장 삭제
          </button>
          <p className="mt-2 text-center text-xs text-stone-400">
            방명록과 참석 회신 기록도 함께 삭제되며 되돌릴 수 없어요.
          </p>
        </form>
      </div>

      {/* ---------- 주소 검색 모달 ---------- */}
      {postcodeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPostcodeOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <span className="font-medium text-stone-800">주소 검색</span>
              <button
                type="button"
                onClick={() => setPostcodeOpen(false)}
                className="text-stone-400 hover:text-stone-600"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <KakaoPostcodeEmbed
              onComplete={handleAddressComplete}
              style={{ height: 440 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
