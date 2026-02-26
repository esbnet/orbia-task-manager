import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dailyKeys } from "./use-dailies";
import { taskCountKeys } from "./use-task-counts";

export function useArchiveDaily() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`/api/daily/${id}/archive`, {
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Erro ao arquivar daily");
			}
		},
		onSuccess: (_, id) => {
			queryClient.removeQueries({ queryKey: dailyKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: dailyKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
		},
	});
}
