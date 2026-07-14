import { prisma } from "@/infra/database/prisma/prisma-client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const googleClientId =
    process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID
const googleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET

if (!googleClientId || !googleClientSecret) {
    console.error("[auth] Google provider não configurado corretamente", {
        hasGoogleClientId: Boolean(googleClientId),
        hasGoogleClientSecret: Boolean(googleClientSecret),
        hasGOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
        hasGOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        hasAUTH_GOOGLE_ID: Boolean(process.env.AUTH_GOOGLE_ID),
        hasAUTH_GOOGLE_SECRET: Boolean(process.env.AUTH_GOOGLE_SECRET),
    })
}

if (!authSecret) {
    console.error("[auth] Secret ausente", {
        hasAUTH_SECRET: Boolean(process.env.AUTH_SECRET),
        hasNEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: authSecret,
    providers: [
        Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    trustHost: true,
    callbacks: {
        jwt: async ({ token, user, account }) => {
            if (user) {
                token.id = user.id
            }
            return token
        },
        session: async ({ session, token }) => {
            if (token && session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    debug: process.env.AUTH_DEBUG === "true",
})
