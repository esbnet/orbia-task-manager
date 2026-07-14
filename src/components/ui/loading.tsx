import { cn } from "@/lib/utils";

interface LoadingProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	text?: string;
	variant?: "inline" | "page";
}

export function Loading({ className, size = "md", text, variant = "inline" }: LoadingProps) {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
	};

	const variantClasses = {
		inline: "min-h-32 w-full",
		page: "min-h-screen w-full",
	};

	return (
		<div
			className={cn(
				"flex flex-col justify-center items-center gap-2 p-4",
				variantClasses[variant],
				className,
			)}
		>
			<div
				className={cn(
					"border-2 border-foreground/20 border-t-foreground rounded-full animate-spin",
					sizeClasses[size],
				)}
			/>
			{text && (
				<p className="text-foreground/60 text-sm animate-pulse">
					{text}
				</p>
			)}
		</div>
	);
}
