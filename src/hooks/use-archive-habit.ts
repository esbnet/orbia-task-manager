import { useMutation, useQueryClient } from "@tanstack/react-query";
import { habitKeys } from "./use-habits";
import { taskCountKeys } from "./use-task-counts";

export function useArchiveHabit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`/api/habits/${id}/archive`, {
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Erro ao arquivar hábito");
			}
		},
		onSuccess: (_, id) => {
			queryClient.removeQueries({ queryKey: habitKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
			queryClient.invalidateQueries({ queryKey: habitKeys.available() });
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
		},
	});
}
