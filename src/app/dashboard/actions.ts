"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { invitationSchema, slugErrorMessage } from "@/lib/invitation";
import { toKstIso } from "@/lib/datetime";
import { contentSchema } from "@/lib/sections";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }
  return { supabase, user };
}

function parseInvitationForm(formData: FormData) {
  return invitationSchema.safeParse({
    groom_name: formData.get("groom_name"),
    bride_name: formData.get("bride_name"),
    slug: formData.get("slug"),
    wedding_at: formData.get("wedding_at") ?? undefined,
    venue_name: formData.get("venue_name") ?? undefined,
    venue_address: formData.get("venue_address") ?? undefined,
    greeting: formData.get("greeting") ?? undefined,
  });
}

export async function createInvitation(formData: FormData) {
  const { supabase, user } = await requireUser();

  const parsed = parseInvitationForm(formData);
  if (!parsed.success) {
    redirect(
      `/dashboard/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const { wedding_at, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      ...fields,
      wedding_at: toKstIso(wedding_at),
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    const message =
      slugErrorMessage(error?.code) ??
      "청첩장을 만들지 못했습니다. 잠시 후 다시 시도해주세요.";
    redirect(`/dashboard/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${data.id}`);
}

export async function updateInvitation(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = parseInvitationForm(formData);
  if (!parsed.success) {
    redirect(
      `/dashboard/${id}?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  // 섹션 구조(content) 파싱: 실패 시 저장하지 않는다
  let contentRaw: unknown;
  try {
    contentRaw = JSON.parse(String(formData.get("content") ?? ""));
  } catch {
    redirect(
      `/dashboard/${id}?error=${encodeURIComponent("섹션 데이터가 올바르지 않습니다. 새로고침 후 다시 시도해주세요.")}`,
    );
  }
  const contentParsed = contentSchema.safeParse(contentRaw);
  if (!contentParsed.success) {
    redirect(
      `/dashboard/${id}?error=${encodeURIComponent("섹션 내용이 너무 길거나 형식이 맞지 않습니다.")}`,
    );
  }
  const content = contentParsed.data;

  // 방명록/RSVP 의 RLS 게이트(features 컬럼)를 섹션 온오프와 동기화한다
  const enabled = (type: "guestbook" | "rsvp") =>
    content.sections.some((s) => s.type === type && s.enabled);

  const { wedding_at, ...fields } = parsed.data;
  const { error } = await supabase
    .from("invitations")
    .update({
      ...fields,
      wedding_at: toKstIso(wedding_at),
      content,
      features: { guestbook: enabled("guestbook"), rsvp: enabled("rsvp") },
    })
    .eq("id", id);

  if (error) {
    const message =
      slugErrorMessage(error.code) ??
      "저장하지 못했습니다. 잠시 후 다시 시도해주세요.";
    redirect(`/dashboard/${id}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?saved=1`);
}

export async function setInvitationStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") === "published" ? "published" : "draft";

  const { error } = await supabase
    .from("invitations")
    .update({ status })
    .eq("id", id);

  if (error) {
    redirect(
      `/dashboard/${id}?error=${encodeURIComponent("상태를 변경하지 못했습니다.")}`,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?saved=1`);
}

export async function deleteInvitation(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");

  const { error } = await supabase.from("invitations").delete().eq("id", id);

  if (error) {
    redirect(
      `/dashboard/${id}?error=${encodeURIComponent("삭제하지 못했습니다.")}`,
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
