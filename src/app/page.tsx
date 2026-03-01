"use client";

import Link from "next/link";
import { Sparkles, MessageCircle, Eye } from "lucide-react";
import { useWriteModalStore } from "@/store/useWriteModalStore";
import { RecentDreams } from "@/components/features/home/RecentDreams";

export default function Home() {
  const { openModal } = useWriteModalStore();

  return (
    <div className="flex flex-col gap-8 pb-8 pt-4">
      {/* Section 1: Hot Dreams Carousel Placeholder */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          🔥 지금 가장 핫한 꿈 이야기
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {/* Card 1 */}
          <Link href="/community/1" className="snap-center shrink-0 w-64 p-4 rounded-2xl bg-accent border border-border flex flex-col gap-2 hover:bg-muted transition-colors">
            <h3 className="font-semibold text-base line-clamp-2">&quot;로또 1등 당첨자의 번호를 알려주는 돼지 꿈&quot;</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 1,200</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> 45</span>
            </div>
          </Link>
          {/* Card 2 */}
          <Link href="/community/2" className="snap-center shrink-0 w-64 p-4 rounded-2xl bg-accent border border-border flex flex-col gap-2 hover:bg-muted transition-colors">
            <h3 className="font-semibold text-base line-clamp-2">&quot;어젯밤 좀비가 나타나서 학교 옥상으로 도망치는 꿈&quot;</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 850</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> 22</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Section 2: Floating CTA */}
      <section className="flex flex-col gap-3">
        <div className="bg-gradient-to-br from-[#b19cd9]/20 to-[#7b68ee]/20 p-5 rounded-2xl border border-[#b19cd9]/30 flex flex-col items-center text-center gap-4 relative overflow-hidden text-foreground">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
          <h2 className="font-bold text-lg relative z-10">✨ 오늘 아침, 어떤 꿈에서 깨셨나요?</h2>
          <p className="text-sm text-foreground/80 relative z-10 -mt-2">
            휘발되기 전에 몽냥이에게 이야기해 보세요.
          </p>
          <button
            onClick={openModal}
            className="w-full relative z-10 flex items-center justify-center gap-2 bg-[#7b68ee] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#7b68ee]/25 hover:-translate-y-0.5 transition-all text-base"
          >
            <Sparkles className="w-5 h-5" />
            잊기 전에 꿈 얘기하기
          </button>
        </div>
      </section>

      {/* Section 3: Recent Dream Summary */}
      <RecentDreams />
    </div>
  );
}
