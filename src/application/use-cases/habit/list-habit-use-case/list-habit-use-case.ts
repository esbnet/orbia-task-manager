import type { Habit } from "@/domain/entities/habit";
import type { HabitRepository } from "@/domain/repositories/all-repository";

export interface ListHabitOutput {
	habits: Habit[];
}

export class ListHabitUseCase {
	constructor(private habitRepository: HabitRepository) {}

	async execute(): Promise<ListHabitOutput> {
		const habits = await this.habitRepository.list();
		return { habits };
	}
}
