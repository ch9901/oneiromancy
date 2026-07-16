import type { WeddingContent } from "@/lib/sections";
import {
  SectionView,
  type SectionContext,
} from "@/components/invitation/SectionViews";

/** 공개 페이지와 에디터 실시간 미리보기가 함께 쓰는 청첩장 본문 */
export interface InvitationViewProps {
  core: Omit<SectionContext, "settings" | "slots">;
  content: WeddingContent;
  slots?: SectionContext["slots"];
}

export function InvitationView({ core, content, slots }: InvitationViewProps) {
  const ctx: SectionContext = { ...core, settings: content.settings, slots };

  return (
    <div className="bg-[#FDFBF7] px-6 py-10 text-center text-stone-800">
      <div className="space-y-14">
        {content.sections
          .filter((section) => section.enabled)
          .map((section) => (
            <SectionView key={section.id} section={section} ctx={ctx} />
          ))}
      </div>
      <footer className="mt-14 text-xs text-stone-300">
        웨드페이퍼로 만든 청첩장
      </footer>
    </div>
  );
}
