// Shared i18n utilities (isomorphic - safe for server, client, and middleware)

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const locales = ["pt-BR", "en-US", "es-ES"] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = "pt-BR";

// Basic normalization from common tags to our supported locales
const aliasMap: Record<string, Locale> = {
  "pt": "pt-BR",
  "pt-br": "pt-BR",
  "en": "en-US",
  "en-us": "en-US",
  "es": "es-ES",
  "es-es": "es-ES",
};

export function normalizeLocale(input?: string | null): Locale | null {
  if (!input) return null;
  const lc = input.toLowerCase();
  if (aliasMap[lc]) return aliasMap[lc];
  const match = locales.find((l) => l.toLowerCase() === lc);
  return match ?? null;
}

export function detectLocaleFromHeader(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  try {
    // Example: "en-US,en;q=0.9,es;q=0.8"
    const parts = acceptLanguage.split(",").map((p) => p.trim());
    for (const part of parts) {
      const [tag] = part.split(";"); // ignore q
      const norm = normalizeLocale(tag);
      if (norm) return norm;
    }
  } catch {
    // ignore parsing errors
  }
  return defaultLocale;
}

export type Dict = Record<string, any>;

// Minimal dictionaries (can be expanded later)
const dictionaries: Record<Locale, Dict> = {
  "pt-BR": {
    common: {
      comingSoon: "Em breve...",
    },
    profile: {
      mustBeLoggedIn: "Você precisa estar logado para ver esta página.",
      statistics: "Estatísticas",
      activityChart: "Gráfico de Atividades",
      habitsTable: "Tabela de Hábitos",
      userAvatar: "Avatar do usuário",
    },
  },
  "en-US": {
    common: {
      comingSoon: "Coming soon...",
    },
    profile: {
      mustBeLoggedIn: "You must be logged in to view this page.",
      statistics: "Statistics",
      activityChart: "Activity Chart",
      habitsTable: "Habits Table",
      userAvatar: "User avatar",
    },
  },
  "es-ES": {
    common: {
      comingSoon: "Próximamente...",
    },
    profile: {
      mustBeLoggedIn: "Debes iniciar sesión para ver esta página.",
      statistics: "Estadísticas",
      activityChart: "Gráfico de Actividades",
      habitsTable: "Tabla de Hábitos",
      userAvatar: "Avatar de usuario",
    },
  },
};

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function deepGet(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function format(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

export function createTranslatorFromDict(dict: Dict) {
  return (key: string, params?: Record<string, string | number>) => {
    const value = deepGet(dict, key);
    if (typeof value === "string") return format(value, params);
    return key;
  };
}