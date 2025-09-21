"use client";

import { GoalProvider } from "@/contexts/goal-context";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

interface QueryClientProviderWrapperProps {
    children: ReactNode;
}

export function QueryClientProviderWrapper({
    children,
}: QueryClientProviderWrapperProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <GoalProvider>
                {children}
            </GoalProvider>
        </QueryClientProvider>
    );
}