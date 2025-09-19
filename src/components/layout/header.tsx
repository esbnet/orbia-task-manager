"use client";

import { useSession } from "next-auth/react";
import Logo from "../logo";

export function Header() {
    const { data: session, status } = useSession();
    const user = session?.user;

    // Não renderizar nada se estiver carregando ou sem sessão
    // if (status === "loading") {
    //     return (
    //         <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur px-2 py-4 border-b w-full">
    //             <div className="flex md:flex-row flex-col justify-between items-center m-auto h-fit">
    //                 <Logo />
    //                 <div className="flex items-center gap-4">
    //                     <div className="flex justify-center items-center px-4 py-2 border-1 rounded-full">
    //                         <MainNav />
    //                     </div>
    //                     <div className="flex justify-center items-center px-1 border-1 rounded-full">
    //                         {user && <UserAvatar user={user} />}
    //                         <ThemeToggle />
    //                     </div>
    //                 </div>
    //             </div>
    //         </header>
    //     );
    // }

    return (
        <header className="top-0 z-40 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur px-2 py-4 border-b w-full">
            <div className="flex md:flex-row flex-col justify-between items-center gap-4 m-auto h-fit">
                <Logo />
                {/* <div className="flex items-center gap-4">
                    <div className="flex justify-center items-center px-4 py-2.5 border-1 rounded-full">
                        <MainNav />
                    </div>
                    <div className="flex justify-center items-center gap-1 p-1 border-1 rounded-full">
                        {user && <UserAvatar user={user} />}
                        <LanguageSelector />
                        <ThemeToggle />
                    </div>
                </div> */}
            </div>
        </header>
    );
}