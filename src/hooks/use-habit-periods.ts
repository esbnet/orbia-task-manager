import { useQuery } from "@tanstack/react-query";

interface HabitPeriod {
    id: string;
    habitId: string;
    periodType: string;
    startDate: Date;
    endDate?: Date;
    count: number;
    target?: number;
    isActive: boolean;
    habit: {
        title: string;
        difficulty: string;
        tags: string[];
    };
    HabitEntry: {
        timestamp: Date;
    }[];
}

async function fetchHabitPeriods(): Promise<HabitPeriod[]> {
    const response = await fetch('/api/habit-periods');
    if (!response.ok) {
        throw new Error(`Erro ao buscar habit periods: ${response.status}`);
    }
    const data = await response.json();
    return data.habitPeriods || [];
}

export function useHabitPeriods() {
    return useQuery({
        queryKey: ["habitPeriods"],
        queryFn: fetchHabitPeriods,
    });
}