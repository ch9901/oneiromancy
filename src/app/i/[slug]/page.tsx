import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatWeddingAt } from "@/lib/invitation";
import type { Invitation } from "@/lib/types";

interface PublicInvitationPageProps {
  params: Promise<{ slug: string }>;
}

async function getInvitation(slug: string): Promise<Invitation | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as Invitation) ?? null;
}

export async function generateMetadata({
  params,
}: PublicInvitationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation) {
    return { title: "청첩장을 찾을 수 없어요" };
  }

  const title = `${invitation.groom_name} ♥ ${invitation.bride_name} 결혼합니다`;
  const parts = [
    formatWeddingAt(invitation.wedding_at),
    invitation.venue_name,
  ].filter(Boolean);
  const description =
    parts.length > 0 ? parts.join(" · ") : "모바일 청첩장이 도착했어요.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(invitation.cover_image_url
        ? { images: [{ url: invitation.cover_image_url }] }
        : {}),
    },
  };
}

export default async function PublicInvitationPage({
  params,
}: PublicInvitationPageProps) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation) {
    notFound();
  }

  const weddingAt = formatWeddingAt(invitation.wedding_at);

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-[#FDFBF7] px-6 py-14 text-center text-stone-800">
      <p className="mb-10 text-[11px] tracking-[0.35em] text-stone-400">
        WEDDING INVITATION
      </p>

      <div className="mx-auto mb-10 flex h-40 w-40 items-center justify-center rounded-full bg-rose-50 text-5xl">
        💐
      </div>

      <h1 className="mb-2 font-serif text-2xl">
        {invitation.groom_name}{" "}
        <span className="text-rose-400">&</span>{" "}
        {invitation.bride_name}
      </h1>

      {(weddingAt || invitation.venue_name) && (
        <div className="mb-10 text-sm leading-relaxed text-stone-500">
          {weddingAt && <p>{weddingAt}</p>}
          {invitation.venue_name && <p>{invitation.venue_name}</p>}
        </div>
      )}

      {invitation.greeting && (
        <section className="mb-10">
          <h2 className="mb-4 text-[11px] tracking-[0.35em] text-stone-400">
            INVITATION
          </h2>
          <p className="whitespace-pre-line leading-loose text-stone-600">
            {invitation.greeting}
          </p>
        </section>
      )}

      {invitation.venue_address && (
        <section className="mb-10">
          <h2 className="mb-4 text-[11px] tracking-[0.35em] text-stone-400">
            LOCATION
          </h2>
          <p className="text-sm leading-relaxed text-stone-600">
            {invitation.venue_name && (
              <span className="block font-medium">{invitation.venue_name}</span>
            )}
            {invitation.venue_address}
          </p>
        </section>
      )}

      {invitation.features.guestbook && (
        <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="mb-2 font-medium">방명록</h2>
          <p className="text-sm text-stone-400">곧 축하 인사를 남길 수 있어요.</p>
        </section>
      )}

      {invitation.features.rsvp && (
        <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="mb-2 font-medium">참석 여부 회신</h2>
          <p className="text-sm text-stone-400">곧 참석 여부를 알릴 수 있어요.</p>
        </section>
      )}

      <footer className="mt-14 text-xs text-stone-300">
        웨드페이퍼로 만든 청첩장
      </footer>
    </main>
  );
}
