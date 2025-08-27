import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { HabitOutput } from "./list-habit-dto";

export class ToggleCompleteUseCase {
	constructor(private readonly habitRepository: HabitRepository) {}

	async execute(id: string): Promise<HabitOutput> {
		const habit = await this.habitRepository.toggleComplete(id);

		return { habit };
	}
}
