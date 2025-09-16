import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"

import { signOutAction } from "@/actions/sign-out"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UserAvatarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserAvatar({ user }: UserAvatarProps) {
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full w-8 h-8">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 w-4 h-4" />
          <Link href="/profile">
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 w-4 h-4" />
          <Link href="/settings">
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center w-full"
              onClick={() => localStorage.removeItem("tasksOverviewDialogShown")}
            >
              <LogOut className="mr-2 w-4 h-4" />
              <span>Sair</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}