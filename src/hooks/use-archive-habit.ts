import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedApi } from "./use-authenticated-api";
import { habitKeys } from "./use-habits";
import { useSound } from "./use-sound";
import { taskCountKeys } from "./use-task-counts";

export function useArchiveHabit() {
	const queryClient = useQueryClient();
	const { playArchive } = useSound();
	const { assertAuthenticated } = useAuthenticatedApi();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			assertAuthenticated();
			const response = await fetch(`/api/habits/${id}/archive`, {
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Erro ao arquivar hábito");
			}
		},
		onSuccess: (_, id) => {
			playArchive();
			queryClient.removeQueries({ queryKey: habitKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
			queryClient.invalidateQueries({ queryKey: habitKeys.available() });
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
		},
	});
}
