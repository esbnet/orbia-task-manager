"use client";

import { useUserConfig } from "@/hooks/use-user-config";
import { ThemeProvider } from "next-themes";

export function ThemeProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { config } = useUserConfig();

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme={config.theme}
            enableSystem
            disableTransitionOnChange
            value={{
                light: "light",
                dark: "dark",
            }}
        >
            {children}
        </ThemeProvider>
    );
}