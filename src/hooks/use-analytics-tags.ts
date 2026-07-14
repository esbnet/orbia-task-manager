import { useQuery } from "@tanstack/react-query";
import type { Tag } from "@/domain/entities/tag";
import { useAuthenticatedApi } from "./use-authenticated-api";

export function useAnalyticsTags() {
  const { isAuthenticated } = useAuthenticatedApi();

  return useQuery<Tag[]>({
    queryKey: ["analytics-tags"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/tags", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          return [];
        }

        const data = await response.json();
        return Array.isArray(data?.tags) ? data.tags : [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
