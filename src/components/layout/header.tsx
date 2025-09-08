"use client";

import Logo from "../logo";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { UserAvatar } from "@/components/auth/user-avatar";
import { useSession } from "next-auth/react";

export function Header() {
    const { data: session, status } = useSession();
    const user = session?.user;

    // Não renderizar nada se estiver carregando ou sem sessão
    if (status === "loading") {
        return (
            <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur p-4 border-b w-full">
                <div className="flex md:flex-row flex-col justify-between items-center gap-2 m-auto md:p-2 h-fit container">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <MainNav />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur p-4 border-b w-full">
            <div className="flex md:flex-row flex-col justify-between items-center gap-2 m-auto md:p-2 h-fit container">
                <Logo />
                <div className="flex items-center gap-4">
                    <MainNav />
                    <ThemeToggle />
                    {user && <UserAvatar user={user} />}
                </div>

            </div>
        </header>
    );
}