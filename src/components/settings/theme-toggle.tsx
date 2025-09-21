"use client";

import { Moon, Sun } from "lucide-react";

import { useUserConfig } from "@/hooks/use-user-config";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { updateConfig } = useUserConfig();

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        updateConfig({ theme: newTheme });
    };

    return (
        <Button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8"

        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </Button>
    );
}