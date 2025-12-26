import { LOCALE_COOKIE, defaultLocale, normalizeLocale } from "@/i18n/shared";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas
  const publicPaths = [
    "/auth/signin",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/sitemap.xml",
    "/robots.txt",
  ];

  const isPublic = publicPaths.some(path => pathname.startsWith(path));

  // Proteger apenas rotas privadas
  if (!isPublic) {
    const session = await auth();
    
    if (!session?.user?.id) {
      // API retorna 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      
      // Páginas redirecionam para login
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const res = NextResponse.next();

  // Configuração de idioma
  if (!pathname.startsWith("/api/")) {
    const existing = req.cookies.get(LOCALE_COOKIE)?.value ?? null;
    const normalized = normalizeLocale(existing);

    if (!normalized) {
      res.cookies.set(LOCALE_COOKIE, defaultLocale, {
        path: "/",
        sameSite: "lax",
      });
    }
  }

  // Headers de segurança
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
