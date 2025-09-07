"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	const pathname = usePathname();

	return (
		<nav
			className={cn(
				"flex items-center space-x-4 lg:space-x-6",
				className,
			)}
			{...props}
		>
			<Link
				href="/"
				className={cn(
					"font-medium text-muted-foreground hover:text-primary text-sm transition-colors",
					pathname === "/" && "text-primary",
				)}
			>
				Tarefas
			</Link>
			<Link
				href="/settings"
				className={cn(
					"font-medium text-muted-foreground hover:text-primary text-sm transition-colors",
					pathname === "/settings" && "text-primary",
				)}
			>
				Config
			</Link>
			<Link
				href="/dashboard"
				className={cn(
					"font-medium text-muted-foreground hover:text-primary text-sm transition-colors",
					pathname === "/analytics" && "text-primary",
				)}
			>
				Desempenho
			</Link>
			<Link
				href="/metrics"
				className={cn(
					"font-medium text-muted-foreground hover:text-primary text-sm transition-colors",
					pathname === "/metrics" && "text-primary",
				)}
			>
				Métricas
			</Link>
			<Link
				href="/profile"
				className={cn(
					"font-medium text-muted-foreground hover:text-primary text-sm transition-colors",
					pathname === "/profile" && "text-primary",
				)}
			>
				Perfil
			</Link>
		</nav>
	);
}
