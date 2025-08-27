import type { Habit } from "@/domain/entities/habit";
import type { HabitLogRepository } from "@/domain/repositories/all-repository";

export interface CompleteHabitInput {
	habit: Habit;
}

export interface CompleteHabitOutput {
	success: boolean;
	logId: string;
}

export class CompleteHabitUseCase {
	constructor(private habitLogRepository: HabitLogRepository) {}

	async execute(input: CompleteHabitInput): Promise<CompleteHabitOutput> {
		const log = await this.habitLogRepository.create({
			habitId: input.habit.id,
			habitTitle: input.habit.title,
			difficulty: input.habit.difficulty,
			tags: input.habit.tags,
			completedAt: new Date(),
		});

		return {
			success: true,
			logId: log.id,
		};
	}
}
