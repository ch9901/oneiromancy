"use client";

import { useState, use } from "react";
import { ArrowLeft, AlertTriangle, Send, Star, Crown, Heart, CornerDownRight, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);

    // Dummy specific data based on `resolvedParams.id` would theoretically go here.
    const dream = {
        id: resolvedParams.id,
        author: "길잃은 몽냥이",
        time: "1시간 전",
        title: "뱀한테 쫓기다가 낭떠러지에서 떨어지는 꿈",
        content: "어제 밤에 진짜 무서운 꿈을 꿨어. 산길을 걷고 있는데 갑자기 엄청 큰 뱀이 튀어나와서 나를 막 쫓아오는 거야. 도망가다가 결국 낭떠러지에서 떨어졌는데, 그때 딱 깼거든. 이거 진짜 안 좋은 꿈이야? 너무 생생해서 아직도 심장이 뛰어. 예전에 할머니가 뱀 꿈은 좋은 꿈이라고 했던 것 같기도 한데 너무 큰 뱀이라서 무서웠어.",
        tags: ["#뱀", "#추락", "#무서움"],
    };

    const comments = [
        {
            id: 1,
            author: "타로마스터_킴",
            level: 3,
            isExpert: true,
            isSelected: true,
            time: "45분 전",
            content: "스트레스 몽이네요. 하지만 낭떠러지에서 떨어질 때 깼다면 오히려 지금까지 쌓아왔던 고민이나 문제들이 한 번에 풀릴 수 징조로 봅니다. 뱀은 재물을 뜻하기도 하니 길몽일 확률이 높아요! 💸",
            likes: 5,
        },
        {
            id: 2,
            author: "꿈꾸는 고래",
            level: 1,
            isExpert: false,
            isSelected: false,
            time: "30분 전",
            content: "저도 예전에 비슷한 꿈 꿨는데 그날 길가다 5만원 주웠어요ㅋㅋㅋ 복권 하나 사보세요!",
            likes: 2,
        },
        {
            id: 3,
            author: "달빛지기",
            level: 2,
            isExpert: false,
            isSelected: false,
            time: "10분 전",
            content: "뱀한테 물렸으면 더 좋았을 텐데 떨어졌으니 조심하는 게 좋을지도 몰라요. 오늘 하루 차 조심하세요!",
            likes: 0,
        }
    ];

    const [voteCount, setVoteCount] = useState({ lucky: 12, unlucky: 3 });
    const [hasVoted, setHasVoted] = useState<"lucky" | "unlucky" | null>(null);

    const totalVotes = voteCount.lucky + voteCount.unlucky;
    const luckyPercentage = totalVotes === 0 ? 50 : Math.round((voteCount.lucky / totalVotes) * 100);

    const handleVote = (type: "lucky" | "unlucky") => {
        if (hasVoted) return; // Only allow one vote
        setVoteCount(prev => ({
            ...prev,
            [type]: prev[type] + 1
        }));
        setHasVoted(type);
    };

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-slate-900 absolute top-0 left-0 w-full z-10">
            {/* Detail Header */}
            <header className="sticky top-0 z-50 w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-md border-b border-white/10 h-14 flex items-center justify-between px-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-300 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-sm text-slate-300">꿈 상세</span>
                <button className="p-2 -mr-2 text-slate-400 hover:text-red-400 transition-colors">
                    <AlertTriangle className="w-5 h-5" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto">
                {/* Post Content */}
                <div className="p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                            {dream.author.substring(0, 1)}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-200">{dream.author}</div>
                            <div className="text-xs text-slate-500">{dream.time}</div>
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-white mb-4 leading-snug">{dream.title}</h1>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-6 text-[15px]">
                        {dream.content}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2">
                        {dream.tags.map(tag => (
                            <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-900/50">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Voting Area */}
                <div className="p-6 bg-slate-800/30 border-b border-slate-800">
                    <h3 className="text-center font-medium text-slate-200 mb-5">이 꿈, 길몽일까 흉몽일까?</h3>

                    <div className="flex gap-4 justify-between mb-4">
                        <button
                            onClick={() => handleVote("lucky")}
                            disabled={hasVoted !== null}
                            className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${hasVoted === "lucky"
                                ? "bg-pink-500/10 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] text-pink-300 transform scale-105"
                                : hasVoted === null
                                    ? "bg-slate-800 border-slate-700 hover:border-pink-500/50 hover:bg-slate-800 text-slate-300"
                                    : "bg-slate-800/50 border-slate-800 text-slate-500 opacity-50"
                                }`}
                        >
                            <span className="text-2xl mb-1">💸</span>
                            <span className="text-sm font-semibold">대박 길몽!</span>
                            <span className="text-xs opacity-80">{voteCount.lucky}명</span>
                        </button>

                        <button
                            onClick={() => handleVote("unlucky")}
                            disabled={hasVoted !== null}
                            className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${hasVoted === "unlucky"
                                ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-300 transform scale-105"
                                : hasVoted === null
                                    ? "bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 text-slate-300"
                                    : "bg-slate-800/50 border-slate-800 text-slate-500 opacity-50"
                                }`}
                        >
                            <span className="text-2xl mb-1">🌧️</span>
                            <span className="text-sm font-semibold">조심해야 해</span>
                            <span className="text-xs opacity-80">{voteCount.unlucky}명</span>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-600 to-pink-400"
                            initial={{ width: "50%" }}
                            animate={{ width: `${luckyPercentage}%` }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                        />
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                            initial={{ width: "50%" }}
                            animate={{ width: `${100 - luckyPercentage}%` }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                        <span className="text-pink-400">{luckyPercentage}%</span>
                        <span className="text-blue-400">{100 - luckyPercentage}%</span>
                    </div>
                </div>

                {/* Comments Area */}
                <div className="p-5 pb-8">
                    <h3 className="text-slate-300 font-medium mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-400" />
                        <span>댓글 {comments.length}개</span>
                    </h3>

                    <div className="flex flex-col gap-5">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className={`p-4 rounded-xl transition-colors ${comment.isSelected
                                    ? "bg-indigo-900/20 border border-indigo-500/30"
                                    : "bg-slate-800/40"
                                    }`}
                            >
                                {comment.isSelected && (
                                    <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold mb-3 bg-yellow-400/10 inline-flex px-2 py-1 rounded-md">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>질문자 채택!</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold text-sm ${comment.isExpert ? 'text-white' : 'text-slate-200'}`}>
                                            {comment.author}
                                        </span>
                                        {comment.isExpert && (
                                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-300 bg-yellow-900/40 px-1.5 py-0.5 rounded-sm border border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                                                <Crown className="w-3 h-3" />
                                                Lv.{comment.level} 전문 해몽가
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-500">{comment.time}</span>
                                </div>

                                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                    {comment.content}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <button className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                                        <Heart className="w-3.5 h-3.5" />
                                        <span>좋아요 {comment.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                        <CornerDownRight className="w-3.5 h-3.5" />
                                        <span>답글 달기</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Input */}
            <div className="fixed bottom-0 left-0 w-full z-50 p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 safe-area-bottom">
                <div className="max-w-md mx-auto relative flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="몽냥이를 대신해 멋진 해몽을 달아주세요! 🐾"
                        className="w-full bg-slate-800 text-sm text-white placeholder-slate-500 rounded-full px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-700 transition-all"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
