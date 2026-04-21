import { NextResponse } from 'next/server'

export async function GET() {
  const debugEnabled =
    process.env.NODE_ENV !== "production" || process.env.ENABLE_DEBUG_API === "true"
  if (!debugEnabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({
    message: 'Auth API is working',
    env: {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      AUTH_DEBUG: process.env.AUTH_DEBUG,
      AUTH_URL: process.env.AUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      resolved: {
        hasGoogleClientId: !!(process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID),
        hasGoogleClientSecret: !!(process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET),
        hasAuthSecret: !!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
      }
    }
  })
}
