"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Globe,
  LogOut,
  Moon,
  Settings,
  Sun,
  Cog
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { LOCALE_COOKIE } from "@/i18n/shared";
import { useUserConfig } from "@/hooks/use-user-config";

export function UserWidget() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { changeLocale, locale } = useTranslation();
  const { config, updateConfig } = useUserConfig();
  const router = useRouter();
  const [language, setLanguage] = useState(locale || "pt-BR");

  const user = session?.user;
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  useEffect(() => {
    setLanguage(locale || "pt-BR");
  }, [locale]);

  const languages = [
    { code: "pt-BR", name: "🇧🇷 Português" },
    { code: "en-US", name: "🇺🇸 English" },
    { code: "es-ES", name: "🇪🇸 Español" }
  ];

  const handleLanguageChange = async (langCode: string) => {
    setLanguage(langCode as any);
    document.cookie = `${LOCALE_COOKIE}=${langCode}; path=/; SameSite=Lax`;
    changeLocale(langCode as any);
    await updateConfig({ ...config, language: langCode as any });
    window.location.reload();
  };

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Settings }
  ];

  return (
    <div className="top-4 right-4 z-[60] fixed">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-lg">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm">{user?.name || "Usuário"}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="mb-2 w-56">
          {/* User Info */}
          <div className="px-2 py-1.5">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-muted-foreground text-xs">{user?.email}</p>
          </div>

          <DropdownMenuSeparator />

          {/* Theme Selector */}
          <div className="px-2 py-1">
            <p className="mb-1 font-medium text-muted-foreground text-xs">Tema</p>
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <DropdownMenuItem
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`text-sm ${theme === themeOption.value ? 'bg-accent' : ''}`}
                >
                  <Icon className="mr-2 w-4 h-4" />
                  {themeOption.label}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          {/* Language Selector */}
          <div className="px-2 py-1">
            <p className="mb-1 font-medium text-muted-foreground text-xs">Idioma</p>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`text-sm ${language === lang.code ? 'bg-accent' : ''}`}
              >
                <Globe className="mr-2 w-4 h-4" />
                {lang.name}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />

          {/* Settings */}
          <DropdownMenuItem onClick={() => router.push('/settings')} className="text-sm">
            <Cog className="mr-2 w-4 h-4" />
            Configurações
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
            <LogOut className="mr-2 w-4 h-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}