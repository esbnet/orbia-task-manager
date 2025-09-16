"use client";

import type { Dict, Locale } from "@/i18n/shared";
import { createContext, useContext, useMemo } from "react";

import { createTranslatorFromDict } from "@/i18n/shared";

type I18nContextValue = {
    locale: Locale;
    dict: Dict;
    t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
    locale,
    dict,
    children,
}: {
    locale: Locale;
    dict: Dict;
    children: React.ReactNode;
}) {
    const t = useMemo(() => createTranslatorFromDict(dict), [dict]);
    const value = useMemo(() => ({ locale, dict, t }), [locale, dict, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error("useI18n must be used within I18nProvider");
    }
    return ctx;
}