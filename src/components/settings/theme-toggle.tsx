"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useUserConfig } from "@/hooks/use-user-config";

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

        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </Button>
    );
}