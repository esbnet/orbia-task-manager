import { useQuery } from "@tanstack/react-query";

interface DailyLog {
    id: string;
    dailyId: string;
    periodId?: string;
    dailyTitle: string;
    completedAt: Date;
    difficulty: string;
    tags: string[];
    createdAt: Date;
}

async function fetchDailyLogs(): Promise<DailyLog[]> {
    const response = await fetch('/api/daily-logs');
    if (!response.ok) {
        throw new Error(`Erro ao buscar daily logs: ${response.status}`);
    }
    const data = await response.json();
    return data.dailyLogs || [];
}

export function useDailyLogs() {
    return useQuery({
        queryKey: ["dailyLogs"],
        queryFn: fetchDailyLogs,
    });
}