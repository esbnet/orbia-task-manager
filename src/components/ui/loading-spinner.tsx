import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  variant?: "inline" | "page";
}

export function LoadingSpinner({ className, variant = "inline" }: LoadingSpinnerProps) {
  const variantClasses = {
    inline: "min-h-32",
    page: "min-h-[50vh]",
  };

  return (
    <div className={cn("flex justify-center items-center p-8 w-full", variantClasses[variant], className)}>
      <div className="border-2 border-foreground/20 border-t-foreground rounded-full w-8 h-8 animate-spin" />
    </div>
  );
}