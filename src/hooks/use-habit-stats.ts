import { useQuery } from "@tanstack/react-query";

export interface HabitStats {
	habitId: string;
	habitTitle: string;
	currentPeriod?: {
		period: {
			id: string;
			count: number;
			target?: number;
		};
		entries: any[];
		completionRate: number;
	};
	historicalPeriods: any[];
	totalEntries: number;
	todayEntries: number;
	averagePerPeriod: number;
	streak: {
		currentStreak: number;
		longestStreak: number;
		lastCompletedDate?: Date;
		isActiveToday: boolean;
	};
}

export function useHabitStats(habitId: string) {
	return useQuery<HabitStats>({
		queryKey: ["habit-stats", habitId],
		queryFn: async () => {
			const response = await fetch(`/api/habits/${habitId}/stats`);
			if (!response.ok) {
				throw new Error("Failed to fetch habit stats");
			}
			return response.json();
		},
		enabled: !!habitId,
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});
}

export function useMultipleHabitStats(habitIds: string[]) {
	return useQuery<Record<string, HabitStats>>({
		queryKey: ["multiple-habit-stats", habitIds],
		queryFn: async () => {
			const promises = habitIds.map(async (habitId) => {
				const response = await fetch(`/api/habits/${habitId}/stats`);
				if (!response.ok) {
					throw new Error(`Failed to fetch stats for habit ${habitId}`);
				}
				const stats = await response.json();
				return [habitId, stats] as const;
			});

			const results = await Promise.all(promises);
			return Object.fromEntries(results);
		},
		enabled: habitIds.length > 0,
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});
}