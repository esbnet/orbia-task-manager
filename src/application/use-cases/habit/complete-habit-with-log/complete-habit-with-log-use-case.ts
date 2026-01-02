import type { Habit } from "@/domain/entities/habit";
import type { HabitRepository } from "@/domain/repositories/all-repository";

export interface CompleteHabitWithLogInput {
	habitId: string;
}

export interface CompleteHabitWithLogOutput {
	success: boolean;
	updatedHabit: Habit;
}

export class CompleteHabitWithLogUseCase {
	constructor(private habitRepository: HabitRepository) {}

	async execute(input: CompleteHabitWithLogInput): Promise<CompleteHabitWithLogOutput> {
		const habit = await this.habitRepository.findById(input.habitId);
		if (!habit) throw new Error("Hábito não encontrado");

		const updatedHabit = await this.habitRepository.update({
			...habit,
			status: "Completo",
		});

		return { success: true, updatedHabit };
	}
}
