"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";

export function MainNav({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	const pathname = usePathname();
	const { t } = useTranslation();

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
				{t("navigation.tasks")}
			</Link>
			<Link
				href="/dashboard"
				className={cn(
					"font-medium text-muted-foreground hover:text-primary text-sm transition-colors",
					pathname === "/analytics" && "text-primary",
				)}
			>
				{t("navigation.performance")}
			</Link>
			<Link
				href="/metrics"
				className={cn(
					"font-medium text-muted-foreground hover:text-primary text-sm transition-colors",
					pathname === "/metrics" && "text-primary",
				)}
			>
				{t("navigation.metrics")}
			</Link>
		</nav>
	);
}
