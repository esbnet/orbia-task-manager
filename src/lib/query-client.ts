import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Cache por 5 minutos
			staleTime: 5 * 60 * 1000, // 5 minutos
			// Cache por 10 minutos
			gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
			// Re-fetch em foco da janela
			refetchOnWindowFocus: false,
			// Re-fetch em reconnect
			refetchOnReconnect: true,
			// Número de tentativas
			retry: 2,
			// Retry delay exponencial
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		},
		mutations: {
			// Retry mutations uma vez
			retry: 1,
			// Mostrar erro por 5 segundos
			onError: (error) => {
				console.error("Mutation error:", error);
			},
		},
	},
});