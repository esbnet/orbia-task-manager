import { auth } from "@/auth"
import { cache } from "react"

const DEV_FALLBACK_USER_ID = process.env.DEV_FALLBACK_USER_ID || "temp-dev-user"

function canUseDevAuthFallback() {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH_FALLBACK !== "false"
}

// ✅ Para uso em Server Components e API Routes APENAS
export const getCurrentUser = cache(async () => {
  try {
    const session = await auth()
    return session?.user
  } catch (error) {
    return null
  }
})

export const getCurrentUserId = cache(async () => {
  try {
    const user = await getCurrentUser()
    return user?.id
  } catch (error) {
    return null
  }
})

// 🚨 TEMPORÁRIO: Versão sem autenticação para desenvolvimento
// TODO: Implementar autenticação do lado cliente adequada
export const getCurrentUserIdSafe = async (): Promise<string | null> => {
  // Para desenvolvimento, retorna um userId padrão.
  // Em produção, nunca deve mascarar falha de autenticação.
  return canUseDevAuthFallback() ? DEV_FALLBACK_USER_ID : null;
}

// Função para API Routes - com fallback para desenvolvimento
export const getCurrentUserIdWithFallback = async (): Promise<string | null> => {
  const userId = await getCurrentUserId();
  if (userId) return userId;
  return canUseDevAuthFallback() ? DEV_FALLBACK_USER_ID : null;
}
