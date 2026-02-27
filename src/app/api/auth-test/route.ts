import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const debugEnabled =
      process.env.NODE_ENV !== "production" || process.env.ENABLE_DEBUG_API === "true"
    if (!debugEnabled) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const session = await auth()
    
    return NextResponse.json({
      success: true,
      session: session,
      message: 'Auth module loaded successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to load auth module'
    }, { status: 500 })
  }
}
