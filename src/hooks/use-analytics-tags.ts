import { PrismaTagRepository } from "@/infra/database/prisma/prisma-tag-repository";
import { useQuery } from "@tanstack/react-query";

const tagRepository = new PrismaTagRepository();

export function useAnalyticsTags() {
  return useQuery({
    queryKey: ["analytics-tags"],
    queryFn: async () => {
      try {
        const tags = await tagRepository.list();
        return tags;
      } catch (error) {
        console.error("Erro ao buscar tags para analytics:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}