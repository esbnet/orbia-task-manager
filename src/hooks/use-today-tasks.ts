import { InitialDialogManager, TaskCategory } from "@/domain/services/initial-dialog-manager";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

export function useTodayTasks() {
	const [categorizedTasks, setCategorizedTasks] = useState<Record<string, TaskCategory[]>>({});

	const {
		data: tasks,
		isLoading,
		error,
		refetch
	} = useQuery({
		queryKey: ["today-tasks"],
		queryFn: async (): Promise<TaskCategory[]> => {
			const [habitsRes, dailiesRes, todosRes, goalsRes] = await Promise.all([
				fetch("/api/habits/available"),
				fetch("/api/daily/available"),
				fetch("/api/todos"),
				fetch("/api/goals"),
			]);

			const [habitsData, dailiesData, todosData, goalsData] = await Promise.all([
				habitsRes.json(),
				dailiesRes.json(),
				todosRes.json(),
				goalsRes.json(),
			]);

			const habits = habitsData.availableHabits || [];
			const dailies = dailiesData.availableDailies || [];
			const todos = todosData.todos || [];
			const goals = Array.isArray(goalsData) ? goalsData : [];

			const allTasks: any[] = [];

			// Processar hábitos disponíveis hoje
			habits.forEach((habit: any) => {
				allTasks.push({
					id: habit.id,
					title: habit.title,
					type: "habit",
					status: habit.status || "Em Andamento",
					isOverdue: false, // Se está disponível, não está atrasado
					todayEntries: habit.todayEntries || 0,
				});
			});

			// Processar dailies disponíveis hoje
			dailies.forEach((daily: any) => {
				allTasks.push({
					id: daily.id,
					title: daily.title,
					type: "daily",
					status: "Ativa",
					isOverdue: false, // Se está disponível, não está atrasado
					lastCompletedDate: daily.lastCompletedDate,
				});
			});

			// Processar todos pendentes (não completados hoje)
			todos.forEach((todo: any) => {
				const today = new Date().toISOString().split("T")[0];
				const isCompletedToday = todo.lastCompletedDate === today;
				const isOverdue = !isCompletedToday;
				allTasks.push({
					id: todo.id,
					title: todo.title,
					type: "todo",
					status: isCompletedToday ? "Completa" : "Pendente",
					isOverdue,
				});
			});

			// Processar goals em andamento
			goals.forEach((goal: any) => {
				const isOverdue = goal.status === "IN_PROGRESS" &&
					new Date(goal.targetDate) < new Date();
				allTasks.push({
					id: goal.id,
					title: goal.title,
					type: "goal",
					status: goal.status,
					isOverdue,
					dueDate: new Date(goal.targetDate),
				});
			});

			// Categorizar e filtrar apenas tarefas de hoje
			const categorized = InitialDialogManager.categorizeTasks(allTasks);
			const todayTasks = InitialDialogManager.filterTodayTasks(categorized);

			return todayTasks;
		},
		staleTime: 2 * 60 * 1000, // 2 minutos
	});

	useEffect(() => {
		if (tasks) {
			const grouped = InitialDialogManager.groupTasksByCategory(tasks);
			setCategorizedTasks(grouped);
		}
	}, [tasks]);

	return {
		categorizedTasks,
		tasks: tasks || [],
		isLoading,
		error,
		refetch,
		overdueCount: categorizedTasks.overdue?.length || 0,
		pendingCount: categorizedTasks.pending?.length || 0,
		totalCount: tasks?.length || 0,
	};
}