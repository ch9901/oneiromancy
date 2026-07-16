import { z } from "zod";

/**
 * 청첩장 섹션 데이터 모델.
 *
 * invitations.content (jsonb) 에 저장되는 구조:
 *   { version: 1, settings: {...}, sections: [{ id, type, enabled, data }, ...] }
 *
 * 섹션 배열의 순서 = 청첩장에 보이는 순서. (순서변경 기능의 근거)
 * 새 섹션 타입을 추가할 때는 (1) 스키마 (2) DEFAULT_SECTIONS (3) SECTION_TITLES
 * (4) 뷰/에디터 컴포넌트 네 곳을 함께 등록한다.
 */

const short = (max: number) => z.string().trim().max(max);

/* ---------- 개별 섹션 데이터 스키마 ---------- */

const person = z.object({
  name: short(20),
  phone: short(20).optional(),
});

const parentInfo = z.object({
  father: person.optional(),
  mother: person.optional(),
  /** 장남, 차녀 등 */
  relation: short(10).optional(),
  /** 고인 표시 (國花) */
  fatherDeceased: z.boolean().optional(),
  motherDeceased: z.boolean().optional(),
});

export const sectionSchemas = {
  /** 메인 커버 */
  main: z.object({
    tagline: short(40),
    showDate: z.boolean(),
    showVenue: z.boolean(),
  }),

  /** 가족 정보 (혼주 성함) */
  family: z.object({
    groom: parentInfo,
    bride: parentInfo,
  }),

  /** 글귀 (시/문구 인용) */
  quote: z.object({
    text: short(300),
    source: short(50).optional(),
  }),

  /** 인사말 */
  greeting: z.object({
    title: short(30),
    text: short(1000),
  }),

  /** 달력 + D-day */
  calendar: z.object({
    showDday: z.boolean(),
  }),

  /** 프로필형 소개 */
  profiles: z.object({
    groomIntro: short(200),
    brideIntro: short(200),
  }),

  /** 신랑신부 연락하기 */
  contacts: z.object({
    groomPhone: short(20),
    bridePhone: short(20),
  }),

  /** 혼주 연락하기 */
  parentContacts: z.object({
    groom: parentInfo,
    bride: parentInfo,
  }),

  /** 타임라인 (우리의 이야기) */
  timeline: z.object({
    items: z
      .array(z.object({ date: short(20), title: short(40), text: short(200) }))
      .max(20),
  }),

  /** 웨딩 인터뷰 (Q&A) */
  interview: z.object({
    items: z.array(z.object({ q: short(100), a: short(500) })).max(10),
  }),

  /** 오시는 길 (예식장 정보 표시) */
  venue: z.object({
    note: short(200).optional(),
  }),

  /** 교통수단 안내 */
  transport: z.object({
    items: z
      .array(z.object({ label: short(20), text: short(200) }))
      .max(10),
  }),

  /** 안내문 (카드형/박스형) */
  notice: z.object({
    style: z.enum(["card", "box"]),
    items: z
      .array(z.object({ title: short(40), text: short(500) }))
      .max(10),
  }),

  /** 참석 여부 회신 */
  rsvp: z.object({
    intro: short(200).optional(),
  }),

  /** 마음 전하실 곳 (계좌번호) */
  accounts: z.object({
    groups: z
      .array(
        z.object({
          label: short(20),
          accounts: z
            .array(
              z.object({
                bank: short(20),
                number: short(30),
                holder: short(20),
              }),
            )
            .max(6),
        }),
      )
      .max(4),
  }),

  /** 방명록 */
  guestbook: z.object({
    intro: short(200).optional(),
  }),

  /** 함께한 시간 (만난 날부터 카운트) */
  together: z.object({
    since: short(10), // YYYY-MM-DD
    text: short(100),
  }),

  /** D-DAY 하객 안내 */
  ddayInfo: z.object({
    items: z
      .array(z.object({ title: short(40), text: short(300) }))
      .max(10),
  }),

  /** 엔딩 */
  ending: z.object({
    text: short(300),
  }),
} as const;

export type SectionType = keyof typeof sectionSchemas;
export type SectionData<T extends SectionType> = z.infer<
  (typeof sectionSchemas)[T]
>;

export type Section = {
  [T in SectionType]: {
    id: string;
    type: T;
    enabled: boolean;
    data: SectionData<T>;
  };
}[SectionType];

// 타입별 스키마 목록에서 discriminated union 을 동적으로 만든다.
// 동적 생성이라 zod 가 튜플 타입을 추론하지 못하므로 Section 으로 명시한다.
const sectionSchema = z.discriminatedUnion(
  "type",
  Object.entries(sectionSchemas).map(([type, data]) =>
    z.object({
      id: z.string().max(40),
      type: z.literal(type),
      enabled: z.boolean(),
      data,
    }),
  ) as never,
) as unknown as z.ZodType<Section>;

/* ---------- 전역 설정 ---------- */

export const settingsSchema = z.object({
  /** 신랑·신부·혼주 명칭변경 */
  labels: z.object({
    groom: short(10),
    bride: short(10),
    groomParents: short(10),
    brideParents: short(10),
  }),
});

export type WeddingSettings = z.infer<typeof settingsSchema>;

export const contentSchema = z.object({
  version: z.literal(1),
  settings: settingsSchema,
  sections: z.array(sectionSchema).max(40),
});

export type WeddingContent = z.infer<typeof contentSchema>;

/* ---------- 섹션 메타 ---------- */

export const SECTION_TITLES: Record<SectionType, string> = {
  main: "메인",
  family: "가족 정보",
  quote: "글귀",
  greeting: "인사말",
  calendar: "달력",
  profiles: "프로필형 소개",
  contacts: "신랑신부 연락하기",
  parentContacts: "혼주 연락하기",
  timeline: "타임라인",
  interview: "웨딩 인터뷰",
  venue: "오시는 길",
  transport: "교통수단",
  notice: "안내문",
  rsvp: "참석여부 RSVP",
  accounts: "계좌번호",
  guestbook: "방명록",
  together: "함께한 시간",
  ddayInfo: "D-DAY 하객 안내",
  ending: "엔딩",
};

/* ---------- 기본값 ---------- */

const emptyParents = { groom: {}, bride: {} };

function defaultSections(seed: { greeting: string | null }): Section[] {
  return [
    { id: "main", type: "main", enabled: true, data: { tagline: "WEDDING INVITATION", showDate: true, showVenue: true } },
    { id: "greeting", type: "greeting", enabled: true, data: { title: "모시는 글", text: seed.greeting ?? "" } },
    { id: "quote", type: "quote", enabled: false, data: { text: "", source: "" } },
    { id: "family", type: "family", enabled: false, data: emptyParents },
    { id: "calendar", type: "calendar", enabled: true, data: { showDday: true } },
    { id: "profiles", type: "profiles", enabled: false, data: { groomIntro: "", brideIntro: "" } },
    { id: "contacts", type: "contacts", enabled: false, data: { groomPhone: "", bridePhone: "" } },
    { id: "parentContacts", type: "parentContacts", enabled: false, data: emptyParents },
    { id: "timeline", type: "timeline", enabled: false, data: { items: [] } },
    { id: "interview", type: "interview", enabled: false, data: { items: [] } },
    { id: "venue", type: "venue", enabled: true, data: { note: "" } },
    { id: "transport", type: "transport", enabled: false, data: { items: [] } },
    { id: "notice", type: "notice", enabled: false, data: { style: "card", items: [] } },
    { id: "rsvp", type: "rsvp", enabled: true, data: { intro: "" } },
    { id: "accounts", type: "accounts", enabled: false, data: { groups: [{ label: "신랑측", accounts: [] }, { label: "신부측", accounts: [] }] } },
    { id: "guestbook", type: "guestbook", enabled: true, data: { intro: "" } },
    { id: "together", type: "together", enabled: false, data: { since: "", text: "우리가 함께한 시간" } },
    { id: "ddayInfo", type: "ddayInfo", enabled: false, data: { items: [] } },
    { id: "ending", type: "ending", enabled: false, data: { text: "" } },
  ];
}

export const DEFAULT_SETTINGS: WeddingSettings = {
  labels: {
    groom: "신랑",
    bride: "신부",
    groomParents: "신랑측 혼주",
    brideParents: "신부측 혼주",
  },
};

/**
 * DB 의 content jsonb 를 안전하게 파싱한다.
 * 비어 있거나(구버전 데이터) 깨져 있으면 기본 구성을 만들어 돌려주고,
 * 저장된 목록에 없는 새 섹션 타입은 기본값으로 뒤에 채워 넣는다.
 */
export function parseContent(
  raw: unknown,
  seed: { greeting: string | null },
): WeddingContent {
  const defaults = defaultSections(seed);
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    return { version: 1, settings: DEFAULT_SETTINGS, sections: defaults };
  }

  const existing = new Set(parsed.data.sections.map((s) => s.type));
  const missing = defaults.filter((s) => !existing.has(s.type));
  return {
    ...parsed.data,
    sections: [...parsed.data.sections, ...missing],
  };
}
