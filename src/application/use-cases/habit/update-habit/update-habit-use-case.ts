import type { UpdateHabitInput, UpdateHabitOutput } from "./update-habit-dto";

import type { HabitRepository } from "@/domain/repositories/all-repository";

export class UpdateHabitUseCase {
	constructor(private readonly habitRepository: HabitRepository) {}

	async execute(inputHabit: UpdateHabitInput): Promise<UpdateHabitOutput> {
		const habit = await this.habitRepository.update(inputHabit);
		return habit;
	}
}
