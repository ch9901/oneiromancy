import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvitationEditor } from "@/components/editor/InvitationEditor";
import { parseContent } from "@/lib/sections";
import type { Invitation } from "@/lib/types";

export const metadata: Metadata = {
  title: "청첩장 수정",
};

interface EditorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}

export default async function EditorPage({ params, searchParams }: EditorPageProps) {
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className="min-h-dvh bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700">
            ← 내 청첩장
          </Link>
          <span className="font-medium text-stone-800">
            {invitation.groom_name} ♥ {invitation.bride_name}
          </span>
          <span className="w-16" />
        </div>
      </header>

      <InvitationEditor
        invitation={invitation}
        content={parseContent(invitation.content, { greeting: invitation.greeting })}
        publicUrl={`${siteUrl}/i/${invitation.slug}`}
        error={error}
        saved={Boolean(saved)}
      />
    </main>
  );
}
