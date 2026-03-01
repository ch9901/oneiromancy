"use client";

import Link from "next/link";
import { Home, MessageSquare, PlusCircle, Book, User } from "lucide-react";
import { useWriteModalStore } from "@/store/useWriteModalStore";
import { usePathname } from "next/navigation";

export function BottomNav() {
    const openModal = useWriteModalStore((state) => state.openModal);
    const pathname = usePathname();

    if (pathname && (pathname.startsWith('/result') || pathname.match(/^\/community\/.+/))) return null;

    return (
        <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-background border-t border-border pb-safe z-40">
            <div className="flex justify-around items-center h-16">
                <Link href="/" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] mt-1 font-medium">홈</span>
                </Link>
                <Link href="/community" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-[10px] mt-1 font-medium">커뮤니티</span>
                </Link>
                <button
                    onClick={openModal}
                    className="flex flex-col items-center text-primary-500 hover:text-primary-600 transition-colors -mt-4 cursor-pointer outline-none active:scale-95 transform"
                >
                    <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-primary/30 transition-shadow">
                        <PlusCircle className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] mt-1 font-bold text-primary">꿈 기록</span>
                </button>
                <Link href="/diary" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
                    <Book className="w-6 h-6" />
                    <span className="text-[10px] mt-1 font-medium">일기장</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] mt-1 font-medium">마이</span>
                </Link>
            </div>
        </nav>
    );
}
