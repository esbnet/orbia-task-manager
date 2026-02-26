import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { InputSanitizer } from '@/infra/validation/input-sanitizer';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  // Adicionar headers de cache para assets estáticos
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
  
  // Headers de segurança e performance
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - start;
    const safeMethod = InputSanitizer.sanitizeForLog(request.method || 'UNKNOWN');
    const safePath = InputSanitizer.sanitizeForLog(request.nextUrl.pathname || '/unknown');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};