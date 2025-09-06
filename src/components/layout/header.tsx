import { auth } from "@/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { MainNav } from "@/components/layout/main-nav";
import { CheckSquare2 } from "lucide-react";
import Link from "next/link";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur p-4 border-b w-full">
      <div className="flex md:flex-row flex-col justify-between items-center gap-2 m-auto md:p-2 h-fit container">

        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-full text-slate-300">
          <Link href="/" className="flex items-center gap-2">
            <CheckSquare2 className="w-6 h-6" />
            <span className="font-bold">Task Manager</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <MainNav />
          {user && <UserAvatar user={user} />}
        </div>

      </div>
    </header>
  );
}