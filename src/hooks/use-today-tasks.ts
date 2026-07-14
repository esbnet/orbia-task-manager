import { InitialDialogManager } from "@/domain/services/initial-dialog-manager";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { fetchAvailableHabits } from "@/hooks/use-habits";
import { getTodayDateInSaoPaulo } from "@/lib/date-utils";
import { isTodoPendingForToday } from "@/lib/todo-recurrence";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useTodayTasks() {
	const { isAuthenticated } = useAuthenticatedApi();

	const [habitsQuery, todosQuery, goalsQuery] = useQueries({
		queries: [
			{
				queryKey: ["habits", "available"] as const,
				queryFn: fetchAvailableHabits,
				enabled: isAuthenticated,
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
				enabled: isAuthenticated,
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
				enabled: isAuthenticated,
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
			const isPending = isTodoPendingForToday(todo, today);
			const isCompletedToday = !isPending;
			allTasks.push({
				id: todo.id,
				title: todo.title,
				type: "todo",
				status: isCompletedToday ? "Completa" : "Pendente",
				isOverdue: isPending,
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
		if (!isAuthenticated) return;
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
