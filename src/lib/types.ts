/**
 * 손으로 쓴 도메인 타입.
 * 스키마가 안정되면 `supabase gen types typescript` 로 대체할 것.
 */

export type InvitationStatus = "draft" | "published";

/** 신랑신부가 켜고 끄는 기능 플래그 (invitations.features 컬럼) */
export interface InvitationFeatures {
  guestbook: boolean;
  rsvp: boolean;
}

export const DEFAULT_FEATURES: InvitationFeatures = {
  guestbook: true,
  rsvp: true,
};

export interface Invitation {
  id: string;
  owner_id: string;
  slug: string;
  status: InvitationStatus;

  groom_name: string;
  bride_name: string;
  wedding_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  greeting: string | null;
  cover_image_url: string | null;

  features: InvitationFeatures;

  created_at: string;
  updated_at: string;
}

export interface GuestbookEntry {
  id: string;
  invitation_id: string;
  author_name: string;
  message: string;
  is_hidden: boolean;
  created_at: string;
}

export type RsvpSide = "groom" | "bride";

export interface Rsvp {
  id: string;
  invitation_id: string;
  side: RsvpSide;
  guest_name: string;
  attending: boolean;
  party_size: number;
  dining: boolean | null;
  phone: string | null;
  note: string | null;
  created_at: string;
}
