import type { Habit } from "@/domain/entities/habit";
import type {
	HabitLogRepository,
	HabitRepository,
} from "@/domain/repositories/all-repository";

export interface CompleteHabitWithLogInput {
	habit: Habit;
}

export interface CompleteHabitWithLogOutput {
	success: boolean;
	updatedHabit: Habit;
}

export class CompleteHabitWithLogUseCase {
	constructor(
		private habitRepository: HabitRepository,
		private habitLogRepository: HabitLogRepository,
	) {}

	async execute(
		input: CompleteHabitWithLogInput,
	): Promise<CompleteHabitWithLogOutput> {
		// Create log
		await this.habitLogRepository.create({
			habitId: input.habit.id,
			habitTitle: input.habit.title,
			difficulty: input.habit.difficulty,
			tags: input.habit.tags,
			completedAt: new Date(),
		});

		// Update habit with completion date
		const today = new Date().toISOString().split("T")[0];
		const updatedHabit = { ...input.habit, lastCompletedDate: today };
		const result = await this.habitRepository.update(updatedHabit);

		return {
			success: true,
			updatedHabit: result,
		};
	}
}
