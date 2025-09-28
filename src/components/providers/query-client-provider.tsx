"use client";

import { GoalProvider } from "@/contexts/goal-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

// Configuração otimizada do QueryClient
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface QueryClientProviderWrapperProps {
    children: ReactNode;
}

export function QueryClientProviderWrapper({
    children,
}: QueryClientProviderWrapperProps) {
    const [client] = useState(() => createQueryClient());
    
    return (
        <QueryClientProvider client={client}>
            <GoalProvider>
                {children}
            </GoalProvider>
        </QueryClientProvider>
    );
}