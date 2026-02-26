import type { HabitEntry } from "@/domain/entities/habit-entry";
import type { HabitLogRepository, HabitRepository } from "@/domain/repositories/all-repository";
import type { HabitEntryRepository } from "@/domain/repositories/habit-entry-repository";
import type { HabitPeriodRepository } from "@/domain/repositories/habit-period-repository";

export interface RegisterHabitWithLogInput {
	habitId: string;
	note?: string;
}

export interface RegisterHabitWithLogOutput {
	entry: HabitEntry;
	currentCount: number;
	todayCount: number;
}

export class RegisterHabitWithLogUseCase {
	constructor(
		private habitRepository: HabitRepository,
		private habitPeriodRepository: HabitPeriodRepository,
		private habitEntryRepository: HabitEntryRepository,
		private habitLogRepository: HabitLogRepository,
	) {}

	async execute(input: RegisterHabitWithLogInput): Promise<RegisterHabitWithLogOutput> {
		const habit = await this.habitRepository.findById(input.habitId);
		if (!habit) throw new Error("Hábito não encontrado");

		let activePeriod = await this.habitPeriodRepository.findActiveByHabitId(input.habitId);
		
		if (!activePeriod) {
			activePeriod = await this.habitPeriodRepository.create({
				habitId: input.habitId,
				periodType: habit.reset,
				startDate: new Date(),
			});
		}

		if (this.shouldCreateNewPeriod(activePeriod)) {
			await this.habitPeriodRepository.finalizePeriod(activePeriod.id);
			activePeriod = await this.habitPeriodRepository.create({
				habitId: input.habitId,
				periodType: habit.reset,
				startDate: new Date(),
			});
		}

		const entry = await this.habitEntryRepository.create({
			habitId: input.habitId,
			periodId: activePeriod.id,
			note: input.note,
		});

		await this.habitLogRepository.create({
			habitId: habit.id,
			habitTitle: habit.title,
			difficulty: habit.difficulty,
			tags: habit.tags,
			completedAt: new Date(),
		});

		const updatedPeriod = await this.habitPeriodRepository.incrementCount(activePeriod.id);
		const todayEntries = await this.habitEntryRepository.findTodayByHabitId(input.habitId);

		return {
			entry,
			currentCount: updatedPeriod.count,
			todayCount: todayEntries.length,
		};
	}

	private shouldCreateNewPeriod(period: { periodType: string; startDate: Date }): boolean {
		const now = new Date();
		const start = new Date(period.startDate);
		
		switch (period.periodType) {
			case "Diariamente":
				return now.toDateString() !== start.toDateString();
			case "Semanalmente":
				const weekDiff = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
				return weekDiff >= 1;
			case "Mensalmente":
				return now.getMonth() !== start.getMonth() || now.getFullYear() !== start.getFullYear();
			default:
				return false;
		}
	}
}
