import { useGoals } from "@/contexts/goal-context";
import { useAvailableDailies } from "@/hooks/use-dailies";
import { useTodos } from "@/hooks/use-todos";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface TagCount {
	tag: string;
	count: number;
}

/**
 * Hook para obter distribuição de tags dos hábitos
 */
export function useHabitTags(): TagCount[] {
	const { data: tagStats } = useQuery({
		queryKey: ["habit-tag-stats"],
		queryFn: async (): Promise<TagCount[]> => {
			const response = await fetch("/api/habits/tags/stats");
			if (!response.ok) {
				throw new Error("Erro ao buscar estatísticas de tags dos hábitos");
			}
			const data = await response.json();
			return data.tagStats || [];
		},
		staleTime: 5 * 60 * 1000, // 5 minutos
	});

	return tagStats || [];
}

/**
 * Hook para obter distribuição de tags dos todos
 */
export function useTodoTags(): TagCount[] {
	const { data: todos } = useTodos();

	return useMemo(() => {
		if (!todos) return [];

		const tagCounts: { [key: string]: number } = {};

		todos.forEach((todo) => {
			todo.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		return Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	}, [todos]);
}

/**
 * Hook para obter distribuição de tags dos dailies
 */
export function useDailyTags(): TagCount[] {
	const { data: dailiesData } = useAvailableDailies();

	return useMemo(() => {
		if (!dailiesData?.availableDailies) return [];

		const tagCounts: { [key: string]: number } = {};

		dailiesData.availableDailies.forEach((daily) => {
			daily.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		return Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	}, [dailiesData?.availableDailies]);
}

/**
 * Hook para obter distribuição de tags das metas
 */
export function useGoalTags(): TagCount[] {
	const { goals } = useGoals();

	return useMemo(() => {
		if (!goals) return [];

		const tagCounts: { [key: string]: number } = {};

		goals.forEach((goal) => {
			goal.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		return Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	}, [goals]);
}