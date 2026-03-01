"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWriteModalStore } from "@/store/useWriteModalStore";
import { useDreamStore } from "@/store/useDreamStore";
import { X, Sparkles, Moon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WriteModal() {
    const router = useRouter();
    const { isOpen, closeModal } = useWriteModalStore();
    const { addDream } = useDreamStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const tagsList = ['행복함 😊', '무서움 👻', '신비로움 ✨', '슬픔 😢', '평범함 😐', '긴장됨 땀'];

    // Handle back button (popstate)
    useEffect(() => {
        if (!isOpen) return;

        // Add a dummy state to the history so we can catch the back button
        window.history.pushState({ modal: "write" }, "");

        const handlePopState = (e: PopStateEvent) => {
            // Prevent navigating back
            e.preventDefault();
            closeModal();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            // Clean up history state if closed by other means
            if (window.history.state?.modal === "write") {
                window.history.back();
            }
        };
    }, [isOpen, closeModal]);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(tags => tags.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 2) {
                setSelectedTags(tags => [...tags, tag]);
            }
        }
    };

    const cleanupForm = () => {
        setTitle("");
        setContent("");
        setSelectedTags([]);
        setDate(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = () => {
        if (!title.trim() || !content.trim() || selectedTags.length === 0) {
            alert("제목, 내용, 느낌을 모두 입력해주세요 냥!");
            return;
        }

        setIsSubmitting(true);

        // 새로운 꿈 객체 생성
        const dreamId = `dream-${Date.now()}`;

        // 즉시 임시 결과 페이지로 이동
        addDream({
            id: dreamId,
            title: title.trim(),
            content: content.trim(),
            tags: selectedTags,
            date: date,
            createdAt: Date.now()
        });

        cleanupForm();
        closeModal();

        // 약간의 지연을 주어 모달 닫기 애니메이션과 상태 업데이트가 겹쳐 라우팅이 막히는 현상 방지
        setTimeout(() => {
            router.push(`/result/${dreamId}`);
        }, 100);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex flex-col h-[95dvh] bg-background rounded-t-3xl shadow-2xl overflow-hidden border border-border"
                    >
                        {/* Header */}
                        <header className="flex items-center justify-between p-5 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10 transition-opacity" style={{ opacity: isSubmitting ? 0 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Moon className="w-5 h-5 text-primary" />
                                꿈 기록하기
                            </h2>
                            <button
                                onClick={closeModal}
                                disabled={isSubmitting}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </header>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto relative bg-gradient-to-b from-background to-muted/20">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-5 pb-24 space-y-8"
                                >
                                    {/* Title */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">이번 꿈의 제목</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="어떤 꿈을 꾸셨나요?"
                                            className="w-full p-4 rounded-2xl bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 font-medium text-lg shadow-sm"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">꿈 내용</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="꿈에서 일어난 일들을 생생하게 적어보세요..."
                                            className="w-full h-56 p-4 rounded-2xl bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-muted-foreground/50 leading-relaxed shadow-sm"
                                        />
                                    </div>

                                    {/* Keyword / Category / etc */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-muted-foreground ml-1 flex items-center gap-1">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            어떤 느낌이었나요? (최대 2개)
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            {tagsList.map(tag => {
                                                const isSelected = selectedTags.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        onClick={() => toggleTag(tag)}
                                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm ${isSelected
                                                            ? 'bg-primary/20 border-primary text-primary'
                                                            : 'bg-muted/40 border-border hover:border-primary hover:text-primary hover:bg-primary/5 text-foreground'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-muted-foreground ml-1 flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            언제 꾸셨나요?
                                        </label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full p-4 rounded-2xl bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium shadow-sm block text-card-foreground"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer - Sticky button */}
                        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-background via-background to-transparent pt-12" style={{ pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0 : 1 }}>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                            >
                                <Sparkles className="w-5 h-5" />
                                몽냥이에게 해석 맡기기
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
