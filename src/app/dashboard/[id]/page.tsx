import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  deleteInvitation,
  setInvitationStatus,
  updateInvitation,
} from "@/app/dashboard/actions";
import { toDateTimeLocal } from "@/lib/invitation";
import type { Invitation } from "@/lib/types";

export const metadata: Metadata = {
  title: "청첩장 수정",
};

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

interface EditorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}

export default async function EditorPage({
  params,
  searchParams,
}: EditorPageProps) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/dashboard/${id}`);
  }

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) {
    notFound();
  }
  const invitation = data as Invitation;
  const isPublished = invitation.status === "published";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicUrl = `${siteUrl}/i/${invitation.slug}`;

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <header className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← 내 청첩장
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-stone-900">
            {invitation.groom_name} ♥ {invitation.bride_name}
          </h1>
          <span
            className={
              isPublished
                ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600"
                : "rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500"
            }
          >
            {isPublished ? "발행됨" : "임시저장"}
          </span>
        </div>
      </header>

      {/* 발행 상태 / 공개 링크 */}
      <section className="mb-6 rounded-xl border border-stone-200 bg-white p-4">
        {isPublished ? (
          <>
            <p className="mb-2 text-sm text-stone-600">
              청첩장이 공개돼 있어요:
            </p>
            <a
              href={publicUrl}
              target="_blank"
              className="block break-all rounded-lg bg-stone-50 px-3 py-2 text-sm text-rose-600 underline underline-offset-2"
            >
              {publicUrl}
            </a>
            <form action={setInvitationStatus} className="mt-3">
              <input type="hidden" name="id" value={invitation.id} />
              <input type="hidden" name="status" value="draft" />
              <button className="text-sm text-stone-500 underline underline-offset-2 hover:text-stone-700">
                발행 취소하기
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-stone-600">
              아직 임시저장 상태예요. 발행하면{" "}
              <span className="text-stone-900">/i/{invitation.slug}</span>{" "}
              주소로 누구나 볼 수 있어요.
            </p>
            <form action={setInvitationStatus}>
              <input type="hidden" name="id" value={invitation.id} />
              <input type="hidden" name="status" value="published" />
              <button className="w-full rounded-lg bg-emerald-500 py-2.5 font-medium text-white transition hover:bg-emerald-600">
                발행하기
              </button>
            </form>
          </>
        )}
      </section>

      {/* 수정 폼 */}
      <form action={updateInvitation} className="space-y-4">
        <input type="hidden" name="id" value={invitation.id} />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>신랑 이름</span>
            <input
              name="groom_name"
              required
              maxLength={20}
              defaultValue={invitation.groom_name}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>신부 이름</span>
            <input
              name="bride_name"
              required
              maxLength={20}
              defaultValue={invitation.bride_name}
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
              defaultValue={invitation.slug}
              className={inputClass}
            />
          </div>
          {isPublished && (
            <span className="mt-1 block text-xs text-amber-600">
              발행된 상태에서 주소를 바꾸면 이미 공유한 링크가 열리지 않아요.
            </span>
          )}
        </label>

        <label className="block">
          <span className={labelClass}>예식 일시</span>
          <input
            name="wedding_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(invitation.wedding_at)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>예식장 이름</span>
          <input
            name="venue_name"
            maxLength={50}
            defaultValue={invitation.venue_name ?? ""}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>예식장 주소</span>
          <input
            name="venue_address"
            maxLength={100}
            defaultValue={invitation.venue_address ?? ""}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>인사말</span>
          <textarea
            name="greeting"
            rows={5}
            maxLength={500}
            defaultValue={invitation.greeting ?? ""}
            placeholder="저희 두 사람이 사랑과 믿음으로 한 가정을 이루게 되었습니다..."
            className={inputClass}
          />
        </label>

        <fieldset className="rounded-xl border border-stone-200 bg-white p-4">
          <legend className="px-1 text-sm font-medium text-stone-700">
            하객 참여 기능
          </legend>
          <label className="flex items-center justify-between py-2">
            <span className="text-sm text-stone-700">
              방명록
              <span className="block text-xs text-stone-400">
                하객이 축하 인사를 남길 수 있어요
              </span>
            </span>
            <input
              type="checkbox"
              name="feature_guestbook"
              defaultChecked={invitation.features.guestbook}
              className="h-5 w-5 accent-rose-500"
            />
          </label>
          <label className="flex items-center justify-between py-2">
            <span className="text-sm text-stone-700">
              참석 여부 회신 (RSVP)
              <span className="block text-xs text-stone-400">
                참석 인원과 식사 여부를 받아요
              </span>
            </span>
            <input
              type="checkbox"
              name="feature_rsvp"
              defaultChecked={invitation.features.rsvp}
              className="h-5 w-5 accent-rose-500"
            />
          </label>
        </fieldset>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            저장했습니다.
          </p>
        )}

        <button className="w-full rounded-lg bg-rose-500 py-3 font-medium text-white transition hover:bg-rose-600">
          저장하기
        </button>
      </form>

      {/* 삭제 */}
      <form action={deleteInvitation} className="mt-10 border-t border-stone-200 pt-6">
        <input type="hidden" name="id" value={invitation.id} />
        <button className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50">
          청첩장 삭제
        </button>
        <p className="mt-2 text-center text-xs text-stone-400">
          방명록과 참석 회신 기록도 함께 삭제되며 되돌릴 수 없어요.
        </p>
      </form>
    </main>
  );
}
