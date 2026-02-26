import type { HabitRepository } from "@/domain/repositories/all-repository";

export class ArchiveHabitUseCase {
	constructor(private habitRepository: HabitRepository) {}

	async execute(id: string): Promise<void> {
		const habit = await this.habitRepository.findById(id);
		if (!habit) throw new Error("Habit not found");

		await this.habitRepository.update({ ...habit, status: "archived" });
	}
}
