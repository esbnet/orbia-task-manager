import { LOCALE_COOKIE, detectLocaleFromHeader, normalizeLocale } from "@/i18n/shared";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Middleware: define cookie de idioma baseado no Accept-Language quando ausente
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Configuração de idioma
  const existing = req.cookies.get(LOCALE_COOKIE)?.value ?? null;
  const normalized = normalizeLocale(existing);

  if (!normalized) {
    const detected = detectLocaleFromHeader(req.headers.get("accept-language"));
    res.cookies.set(LOCALE_COOKIE, detected, {
      path: "/",
      sameSite: "lax",
    });
  }

  // Headers de performance
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  
  // Cache para API routes
  if (pathname.startsWith("/api/")) {
    if (pathname.includes("/active-tasks") || pathname.includes("/todos")) {
      res.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    }
  }

  return res;
}

// Evita rodar em assets estáticos/imagens
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/docs).*)",
  ],
};