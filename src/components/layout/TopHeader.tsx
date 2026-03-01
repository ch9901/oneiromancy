"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function TopHeader() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    if (pathname && (pathname.startsWith('/result') || pathname.match(/^\/community\/.+/))) return null;

    return (
        <header className="sticky top-0 z-50 w-full max-w-md mx-auto bg-background/80 backdrop-blur-md border-b border-border h-14">
            <div className="flex items-center justify-between h-full px-4 text-foreground">
                {/* Logo / Title */}
                <Link href="/" className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-lg tracking-tight">DreamLog</span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="Toggle Theme"
                        suppressHydrationWarning
                    >
                        {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <button
                        className="p-2 relative rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {/* Unread badge indicator */}
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
