import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "./use-authenticated-api";

export interface HabitAnalyticsData {
	totalHabits: number;
	activeHabits: number;
	completedHabits: number;
	totalEntries: number;
	completionRate: number;
	currentStreaks: Array<{
		habitId: string;
		habitTitle: string;
		streakDays: number;
		lastEntry: string;
	}>;
	dailyProgress: Array<{
		date: string;
		entries: number;
		target: number;
		completionRate: number;
	}>;
	weeklyTrends: Array<{
		week: string;
		totalEntries: number;
		uniqueHabits: number;
		completionRate: number;
	}>;
	habitsByCategory: Array<{
		category: string;
		count: number;
		completionRate: number;
	}>;
	
	habitsByDifficulty: Array<{
		difficulty: string;
		count: number;
		completionRate: number;
	}>;
}

export function useHabitsAnalytics(timeRange: "week" | "month" | "quarter" | "year" = "month") {
	const { isAuthenticated } = useAuthenticatedApi();

	return useQuery({
		queryKey: ["habits-analytics", timeRange],
		queryFn: async (): Promise<HabitAnalyticsData> => {
			const response = await fetch(`/api/analytics/habits?timeRange=${timeRange}`);
			if (!response.ok) {
				throw new Error("Erro ao buscar analytics de hábitos");
			}
			return response.json();
		},
		enabled: isAuthenticated,
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}
