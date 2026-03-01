"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useDreamStore } from "@/store/useDreamStore";

export function RecentDreams() {
    const { dreams } = useDreamStore();
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch when using localStorage via persist middleware
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        최근 나의 꿈 기록
                    </h2>
                </div>
                {/* Skeleton loader for dreams */}
                <div className="flex flex-col gap-3">
                    <div className="h-24 rounded-xl bg-accent/30 animate-pulse border border-border"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    최근 나의 꿈 기록
                </h2>
                <Link href="/diary" className="text-sm text-muted-foreground flex items-center hover:text-primary transition-colors">
                    더보기 <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
            </div>

            <div className="flex flex-col gap-3">
                {dreams.length > 0 ? (
                    dreams.slice(0, 3).map((dream) => (
                        <Link key={dream.id} href={`/result/${dream.id}`} className="p-4 rounded-xl bg-accent/50 border border-border flex flex-col gap-2 hover:bg-accent transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-mono text-muted-foreground">{dream.date.replace(/-/g, '.')}</span>
                                {dream.tags.length > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 bg-[#b19cd9]/20 text-[#7b68ee] dark:text-[#b19cd9] rounded-full">
                                        {dream.tags[0]}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-medium text-[15px] line-clamp-1">{dream.title}</h3>
                            <p className="text-sm text-[#7b68ee] dark:text-[#b19cd9] flex items-center justify-between mt-1">
                                <span>타로 해몽 보기</span>
                                <ArrowRight className="w-4 h-4" />
                            </p>
                        </Link>
                    ))
                ) : (
                    <div className="p-6 rounded-xl bg-accent/30 border border-border flex flex-col items-center justify-center text-center gap-2">
                        <p className="text-sm text-muted-foreground">아직 기록된 꿈이 없다 냥!</p>
                        <p className="text-xs text-muted-foreground/70">➕ 버튼을 눌러 첫 꿈을 기록해보세요.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
