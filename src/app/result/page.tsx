"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Share2, Sparkles, MessageCircle } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResultPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isBlurred, setIsBlurred] = useState(true);
    const [isAdBuffering, setIsAdBuffering] = useState(false);

    useEffect(() => {
        // 3초 대기 상태 시뮬레이션
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleUnlockReport = () => {
        if (isAdBuffering) return;
        setIsAdBuffering(true);

        // 1초 후 광고 시청 완료 처리 (폭죽 효과 및 블러 해제)
        setTimeout(() => {
            setIsAdBuffering(false);
            setIsBlurred(false);

            // 폭죽 효과
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ["#b19cd9", "#7b68ee", "#f8f8f2", "#818cf8"],
            });
        }, 1000);
    };

    return (
        <>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground"
                    >
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="text-7xl mb-6 shadow-primary/50 drop-shadow-2xl"
                        >
                            🐾
                        </motion.div>
                        <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="text-lg font-medium text-primary mt-4 px-6 text-center"
                        >
                            몽냥이가 열심히 타로 카드를 <br /> 섞고 있다 냥! <Sparkles className="inline-block w-4 h-4 text-yellow-300 ml-1 pb-1" />
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="min-h-screen bg-background text-foreground p-4 pb-32 flex flex-col relative overflow-hidden"
                >
                    {/* Header */}
                    <header className="flex justify-between items-center mb-8 relative z-10">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full"
                        >
                            <ChevronLeft className="w-6 h-6 mr-1" />
                            <span className="font-medium text-lg">닫기</span>
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full bg-accent/50 backdrop-blur-sm">
                            <Share2 className="w-5 h-5 flex items-center justify-center" />
                            <span className="sr-only">공유하기</span>
                        </button>
                    </header>

                    {/* Character Image */}
                    <div className="flex justify-center mb-8 relative z-10">
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-500/80 to-indigo-500/80 flex justify-center items-center shadow-[0_0_30px_rgba(139,92,246,0.3)] border-2 border-purple-400/30"
                        >
                            <span className="text-5xl drop-shadow-md">🔮</span>
                        </motion.div>
                    </div>

                    <div className="space-y-6 relative z-10 w-full max-w-md mx-auto">
                        {/* Section 1: 총평 (무료) */}
                        <motion.section
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-accent/40 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-lg shadow-primary/10"
                        >
                            <h2 className="text-primary font-semibold mb-3 flex items-center">
                                <Sparkles className="w-4 h-4 mr-2" /> 몽냥이의 꿈 총평
                            </h2>
                            <p className="text-foreground/90 leading-relaxed mb-6 font-medium text-[1.05rem]">
                                &quot;이건 엄청난 변화를 암시하는 꿈이네 냥! 새로운 기회가 찾아올 수 있으니 주변을 잘 살펴봐.&quot;
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {["#뱀", "#추락", "#새로운시작"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1.5 bg-muted/50 text-primary text-sm rounded-full font-medium border border-border/50"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.section>

                        {/* Section 2: 심층 리포트 (블러) */}
                        <motion.section
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="relative bg-accent/40 backdrop-blur-md border border-border/60 rounded-3xl p-6 overflow-hidden min-h-[250px] shadow-lg shadow-primary/10"
                        >
                            <div className={`transition-all duration-1000 ${isBlurred ? "blur-md select-none opacity-40 pointer-events-none" : "opacity-100"}`}>
                                <h3 className="text-primary font-semibold mb-4 border-b border-border/50 pb-2">심층 분석 리포트</h3>

                                <div className="space-y-4 text-foreground/80 text-sm">
                                    <div>
                                        <h4 className="text-foreground font-medium mb-1">💰 재물운</h4>
                                        <p>당장 큰돈이 들어오진 않더라도, 재물로 이어질 수 있는 유의미한 인간관계나 기회가 생길 수 있어 냥!</p>
                                    </div>
                                    <div>
                                        <h4 className="text-foreground font-medium mb-1">💖 연애운</h4>
                                        <p>솔로라면 매력적인 누군가와 스치듯 인연이 닿을 수 있고, 연인이 있다면 약간의 오해가 생길 수 있으니 솔직한 대화가 필요해.</p>
                                    </div>
                                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 mt-4">
                                        <h4 className="text-primary font-medium mb-1">🐾 몽냥이의 특별 조언</h4>
                                        <p className="text-primary/90 font-medium">&quot;오늘은 너무 무리하지 말고 따뜻한 차 한 잔 마시며 하루를 여유롭게 마무리해봐 냥!&quot;</p>
                                    </div>
                                </div>
                            </div>

                            {/* 블러 상태일 때 CTA 버튼 (가운데 정렬) */}
                            <AnimatePresence>
                                {isBlurred && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 z-10 px-6 py-8"
                                    >
                                        <button
                                            onClick={handleUnlockReport}
                                            disabled={isAdBuffering}
                                            className="w-full relative overflow-hidden group bg-gradient-to-r from-primary-600 to-primary hover:from-primary hover:to-primary-500 text-primary-foreground font-semibold py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center transform active:scale-95 disabled:opacity-80"
                                        >
                                            {isAdBuffering ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                                    광고 불러오는 중...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="mr-2 text-lg">▶️</span>
                                                    광고 1번 보고 심층 리포트 열기
                                                </>
                                            )}

                                            {/* Button shine effect */}
                                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
                                        </button>
                                        <p className="text-muted-foreground text-xs mt-3 flex items-center">
                                            <span className="inline-block w-3 h-3 rounded-full bg-muted-foreground/30 mr-1.5 flex items-center justify-center text-[8px]">i</span>
                                            10초 내외의 영상을 시청합니다.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.section>
                    </div>

                    {/* Section 3: 하단 고정 액션 버튼 */}
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent z-20 flex justify-center pointer-events-none">
                        <button className="pointer-events-auto w-full max-w-md bg-accent hover:bg-muted border border-border/50 text-foreground rounded-2xl py-4 text-center font-medium shadow-2xl transition-all flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 mr-2 text-muted-foreground" />
                            익명 커뮤니티에 내 꿈 공유하고 의견 듣기
                        </button>
                    </div>

                    {/* Background Ambient Effects */}
                    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
                        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-primary/10 blur-[100px] rounded-full" />
                    </div>
                </motion.div>
            )}
        </>
    );
}
