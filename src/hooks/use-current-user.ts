import { auth } from "@/auth"
import { cache } from "react"

// ✅ Para uso em Server Components e API Routes APENAS
export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user
})

export const getCurrentUserId = cache(async () => {
  const user = await getCurrentUser()
  return user?.id
})

// 🚨 TEMPORÁRIO: Versão sem autenticação para desenvolvimento
// TODO: Implementar autenticação do lado cliente adequada
export const getCurrentUserIdSafe = async (): Promise<string | null> => {
  // Para desenvolvimento, retorna um userId padrão
  // Em produção, isso deveria usar useSession() do next-auth
  return "temp-dev-user";
}

// Função para API Routes - com fallback para desenvolvimento
export const getCurrentUserIdWithFallback = async (): Promise<string | null> => {
  const userId = await getCurrentUserId();
  return userId ?? "temp-dev-user";
}
