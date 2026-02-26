import type {
	CreateHabitInput,
	CreateHabitOutput,
	HabitDifficulty,
	HabitPriority,
	HabitReset,
} from "./create-habit-dto";

import type { HabitRepository } from "@/domain/repositories/all-repository";

export class CreateHabitUseCase {
	constructor(private readonly habitRepository: HabitRepository) {}

	async execute(inputHabit: CreateHabitInput): Promise<CreateHabitOutput> {
		const habit = await this.habitRepository.create({
			userId: inputHabit.userId, // Will be set by repository
			title: inputHabit.title,
			observations: inputHabit.observations,
			difficulty: (inputHabit.difficulty as HabitDifficulty) ?? "Trivial",
			status: "Em Andamento", // Default status for new habits
			priority: (inputHabit.priority as HabitPriority) ?? "Média",
			tags: inputHabit.tags ?? [],
			reset: (inputHabit.reset as HabitReset) ?? "Sempre disponível",
			order: 0,
			currentPeriod: undefined,
			todayEntries: 0
		});

		return {
			habit,
		};
	}
}
