import { auth } from "@/auth"
import { cache } from "react"

// ✅ Para uso em Server Components e API Routes APENAS
export const getCurrentUser = cache(async () => {
  try {
    const session = await auth()
    return session?.user
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return null
  }
})

export const getCurrentUserId = cache(async () => {
  try {
    const user = await getCurrentUser()
    return user?.id
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error)
    return null
  }
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
