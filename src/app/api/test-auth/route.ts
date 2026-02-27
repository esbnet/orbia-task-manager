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
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
  })
}
