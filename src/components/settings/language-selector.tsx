"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useUserConfig } from "@/hooks/use-user-config";
import { useTranslation } from "@/hooks/use-translation";
import { LOCALE_COOKIE } from "@/i18n/shared";
import { Languages } from "lucide-react";

const languages = [
  { code: "pt-BR", label: "🇧🇷 PT" },
  { code: "en-US", label: "🇺🇸 EN" },
  { code: "es-ES", label: "🇪🇸 ES" },
] as const;

export function LanguageSelector() {
  const { config, updateConfig } = useUserConfig();
  const { locale } = useTranslation();

  const { changeLocale } = useTranslation();

  const handleLanguageChange = async (language: string) => {
    document.cookie = `${LOCALE_COOKIE}=${language}; path=/; SameSite=Lax`;
    changeLocale(language as "pt-BR" | "en-US" | "es-ES");
    await updateConfig({ ...config, language: language as "pt-BR" | "en-US" | "es-ES" });
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-16 h-8 border-0 bg-transparent hover:bg-accent">
        <div className="flex items-center gap-1">
          <Languages className="w-3 h-3" />
          <span className="text-xs font-medium">{currentLanguage?.label.split(' ')[1]}</span>
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}