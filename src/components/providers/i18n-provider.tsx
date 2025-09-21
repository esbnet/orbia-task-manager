"use client";

import type { Dict, Locale } from "@/i18n/shared";
import { createContext, useContext, useMemo, useState } from "react";

import { createTranslatorFromDict, getDictionary } from "@/i18n/shared";

type I18nContextValue = {
    locale: Locale;
    dict: Dict;
    t: (key: string, params?: Record<string, string | number>) => string;
    changeLocale: (newLocale: Locale) => void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
    locale: initialLocale,
    dict: initialDict,
    children,
}: {
    locale: Locale;
    dict: Dict;
    children: React.ReactNode;
}) {
    const [locale, setLocale] = useState(initialLocale);
    const [dict, setDict] = useState(initialDict);
    
    const changeLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        setDict(getDictionary(newLocale));
    };
    
    const t = useMemo(() => createTranslatorFromDict(dict), [dict]);
    const value = useMemo(() => ({ locale, dict, t, changeLocale }), [locale, dict, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error("useI18n must be used within I18nProvider");
    }
    return ctx;
}