import type { Todo } from "@/domain/entities/todo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSound } from "./use-sound";
import { taskCountKeys } from "./use-task-counts";
import { todoKeys } from "./use-todos";

// Hook unificado que usa o mesmo endpoint toggle para completar/descompletar

export function useCompleteTodo() {
	const queryClient = useQueryClient();
	const { playComplete } = useSound();

	return useMutation({
		mutationFn: async (todo: Todo): Promise<Todo> => {
			const endpoint = todo.todoType.isPontual()
				? `/api/todos/${todo.id}/complete-pontual`
				: `/api/todos/${todo.id}/complete`;

			const response = await fetch(endpoint, {
				method: "POST",
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Erro ao completar tarefa");
			}

			const result = await response.json();
			return result.todo;
		},
		onSuccess: (updatedTodo) => {
			playComplete();
			queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);
			queryClient.invalidateQueries({ queryKey: todoKeys.all });
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
			queryClient.invalidateQueries({ queryKey: ["weekly-evolution"] });

			toast.success("Tarefa concluída com sucesso!");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao completar tarefa");
		},
	});
}

export function useIncompleteTodo() {
	const queryClient = useQueryClient();
	const { playUpdate } = useSound();

	return useMutation({
		mutationFn: async (id: string): Promise<Todo> => {
			const response = await fetch(`/api/todos/${id}/complete`, {
				method: "POST",
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Erro ao desmarcar tarefa");
			}

			const result = await response.json();
			return result.todo;
		},
		onSuccess: (updatedTodo) => {
			playUpdate();
			queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);
			queryClient.invalidateQueries({ queryKey: todoKeys.all });
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
			queryClient.invalidateQueries({ queryKey: ["weekly-evolution"] });

			toast.success("Tarefa desmarcada com sucesso!");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao desmarcar tarefa");
		},
	});
}