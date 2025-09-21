import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { ListHabitsOutput } from "./list-habit-dto";

export class ListHabitsUseCase {
	constructor(private readonly habitRepository: HabitRepository) {}

	async execute(): Promise<ListHabitsOutput> {
		const habits = await this.habitRepository.list();

		return { habits };
	}
}
