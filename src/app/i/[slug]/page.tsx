import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatWeddingAt } from "@/lib/datetime";
import { InvitationView } from "@/components/invitation/InvitationView";
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

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-[#FDFBF7]">
      <InvitationView invitation={invitation} />
    </main>
  );
}
