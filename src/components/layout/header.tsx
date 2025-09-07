import { auth } from "@/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { MainNav } from "@/components/layout/main-nav";
import Logo from "../logo";

export async function Header() {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur p-4 border-b w-full">
            <div className="flex md:flex-row flex-col justify-between items-center gap-2 m-auto md:p-2 h-fit container">
                <Logo />
                <div className="flex items-center gap-4">
                    <MainNav />
                    {user && <UserAvatar user={user} />}
                </div>

            </div>
        </header>
    );
}