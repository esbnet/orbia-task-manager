import {
  LOCALE_COOKIE,
  type Locale,
  createTranslatorFromDict,
  detectLocaleFromHeader,
  getDictionary,
  normalizeLocale,
} from "@/i18n/shared";
import { cookies, headers } from "next/headers";

// Resolve o locale atual a partir do cookie ou Accept-Language
export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value ?? null);
  if (cookieLocale) return cookieLocale;

  const hdrs = await headers();
  const accept = hdrs.get("accept-language");
  return detectLocaleFromHeader(accept);
}

// Cria tradutor para o locale fornecido
export function createTranslator(locale: Locale) {
  const dict = getDictionary(locale);
  return createTranslatorFromDict(dict);
}

// Helper para uso em Server Components
export async function getServerTranslator() {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  return { locale, t };
}

export { LOCALE_COOKIE } from "@/i18n/shared";
export type { Locale } from "@/i18n/shared";

