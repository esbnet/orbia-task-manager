import { InitialDialogManager } from "@/domain/services/initial-dialog-manager";
import { fetchAvailableHabits } from "@/hooks/use-habits";
import { getTodayDateInSaoPaulo } from "@/lib/date-utils";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

export function useTodayTasks() {
	const [habitsQuery, todosQuery, goalsQuery] = useQueries({
		queries: [
			{
				queryKey: ["habits", "available"] as const,
				queryFn: fetchAvailableHabits,
				staleTime: 60 * 1000,
				refetchOnWindowFocus: true,
			},
			{
				queryKey: ["todos", "list"] as const,
				queryFn: async (): Promise<any[]> => {
					const response = await fetch("/api/todos");
					if (!response.ok) {
						throw new Error("Erro ao buscar todos");
					}
					const data = await response.json();
					return data.todos || [];
				},
				staleTime: 30 * 1000,
				refetchOnWindowFocus: true,
			},
			{
				queryKey: ["goals"] as const,
				queryFn: async (): Promise<any[]> => {
					const response = await fetch("/api/goals");
					if (!response.ok) {
						throw new Error("Erro ao buscar goals");
					}
					const data = await response.json();
					return Array.isArray(data) ? data : (data.goals || []);
				},
				staleTime: 2 * 60 * 1000,
				refetchOnWindowFocus: true,
			},
		],
	});

	const tasks = useMemo(() => {
		const habits = habitsQuery.data?.availableHabits || [];
		const todos = todosQuery.data || [];
		const goals = goalsQuery.data || [];
		const allTasks: any[] = [];

		habits.forEach((habit: any) => {
			allTasks.push({
				id: habit.id,
				title: habit.title,
				type: "habit",
				status: habit.status || "Em Andamento",
				isOverdue: false,
				todayEntries: habit.todayEntries || 0,
			});
		});

		const today = getTodayDateInSaoPaulo();
		todos.forEach((todo: any) => {
			const isCompletedToday = todo.lastCompletedDate === today;
			allTasks.push({
				id: todo.id,
				title: todo.title,
				type: "todo",
				status: isCompletedToday ? "Completa" : "Pendente",
				isOverdue: !isCompletedToday,
			});
		});

		goals.forEach((goal: any) => {
			const isOverdue = goal.status === "IN_PROGRESS" && new Date(goal.targetDate) < new Date();
			allTasks.push({
				id: goal.id,
				title: goal.title,
				type: "goal",
				status: goal.status,
				isOverdue,
				dueDate: new Date(goal.targetDate),
			});
		});

		const categorized = InitialDialogManager.categorizeTasks(allTasks);
		return InitialDialogManager.filterTodayTasks(categorized);
	}, [habitsQuery.data, todosQuery.data, goalsQuery.data]);

	const categorizedTasks = useMemo(
		() => InitialDialogManager.groupTasksByCategory(tasks),
		[tasks],
	);

	const isLoading = habitsQuery.isLoading || todosQuery.isLoading || goalsQuery.isLoading;
	const error = habitsQuery.error || todosQuery.error || goalsQuery.error;
	const refetch = async () => {
		await Promise.all([habitsQuery.refetch(), todosQuery.refetch(), goalsQuery.refetch()]);
	};

	return {
		categorizedTasks,
		tasks,
		isLoading,
		error,
		refetch,
		overdueCount: categorizedTasks.overdue?.length || 0,
		pendingCount: categorizedTasks.pending?.length || 0,
		totalCount: tasks.length,
	};
}
