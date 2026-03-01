"use client";

import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const MOCK_DREAMS = [
    {
        id: 1,
        author: "길잃은 몽냥이",
        time: "1시간 전",
        title: "뱀한테 쫓기다가 낭떠러지에서 떨어지는 꿈",
        preview: "어제 밤에 진짜 무서운 꿈을 꿨어. 산길을 걷고 있는데 갑자기 엄청 큰 뱀이 튀어나와서 나를 막 쫓아오는 거야. 도망가다가 결국 낭떠러지에서 떨어졌는데, 그때 딱 깼거든. 이거 진짜 안 좋은 꿈이야? 너무 생생해서 아직도 심장이 뛰어.",
        tags: ["#뱀", "#추락", "#무서움"],
        likes: 12,
        comments: 5,
        isHot: true,
    },
    {
        id: 2,
        author: "타로보는 냥이",
        time: "3시간 전",
        title: "하늘을 날았는데 기분이 너무 좋았어요",
        preview: "구름 위를 날아다니는 꿈이었어요. 바람도 시원하고 모든 스트레스가 날아가는 기분이었달까요? 이건 무조건 길몽이겠죠?",
        tags: ["#비행", "#자유", "#평온해"],
        likes: 34,
        comments: 12,
        isHot: true,
    },
    {
        id: 3,
        author: "밤의 파수꾼",
        time: "5시간 전",
        title: "이빨이 우수수 빠지는 악몽",
        preview: "밥을 먹고 있는데 갑자기 앞니부터 어금니까지 전부 다 빠져버렸어요. 피는 안 났는데 너무 생생해서 기분이 찝찝해요.",
        tags: ["#이빨", "#불안해", "#악몽"],
        likes: 5,
        comments: 8,
        isHot: false,
    },
];

type TabType = "최신 꿈" | "🔥 핫한 꿈" | "👑 명예의 전당";

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<TabType>("최신 꿈");

    return (
        <div className="flex flex-col min-h-[calc(100vh-8rem)] pb-24">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    커뮤니티
                </h1>
                <p className="text-sm text-slate-400">다른 사람들은 이런 꿈을 꿨다 냥!</p>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {(["최신 꿈", "🔥 핫한 꿈", "👑 명예의 전당"] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`snap-center px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                {MOCK_DREAMS.map((dream) => (
                    <Link href={`/community/${dream.id}`} key={dream.id} className="block">
                        <motion.div
                            whileHover={{ scale: 0.98, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg hover:border-indigo-500/50 hover:shadow-indigo-500/20 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-purple-300">{dream.author}</span>
                                <span className="text-xs text-slate-400">{dream.time}</span>
                            </div>

                            <h2 className="text-lg font-bold text-white mb-2 line-clamp-1">{dream.title}</h2>
                            <p className="text-sm text-slate-300 mb-4 line-clamp-2 leading-relaxed opacity-90">
                                {dream.preview}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {dream.tags.map(tag => (
                                    <span key={tag} className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900/80 text-indigo-300 border border-indigo-500/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-between items-center text-slate-400 text-sm mt-2 border-t border-slate-700/50 pt-3">
                                <span className="text-xs text-slate-500">{dream.isHot && '🔥 요즘 반응이 뜨거워요'}</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 hover:text-pink-400 transition-colors">
                                        <Heart className="w-4 h-4" />
                                        <span>{dream.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{dream.comments}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
