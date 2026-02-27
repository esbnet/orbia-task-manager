import { BaseEntityService, handleServiceError } from "./base/entity-service";
import type { HabitLogRepository, HabitRepository } from "@/domain/repositories/all-repository";

import { CompleteHabitUseCase } from "@/application/use-cases/habit/complete-habit/complete-habit-use-case";
import { ToggleCompleteUseCase } from "@/application/use-cases/habit/toggle-complete-habit/toggle-complete-habit-use-case";
import type { Habit } from "@/domain/entities/habit";
import type { HabitFormData } from "@/types/habit";
import type { HabitLog } from "@/domain/entities/habit-log";

// Habit service implementation
export class HabitService extends BaseEntityService<Habit, HabitFormData> {
	constructor(
		repository: HabitRepository,
		private habitLogRepository?: HabitLogRepository
	) {
		super(repository);
	}

	protected mapFormDataToEntity(data: HabitFormData): Omit<Habit, "id" | "createdAt" | "updatedAt"> {
		return {
			title: data.title,
			observations: data.observations,
			difficulty: data.difficulty,
			status: "Em Andamento", // Default status for new habits
			priority: data.priority,
			tags: data.tags,
			reset: data.reset,
			userId: "", // Will be set by repository
			order: 0, // Will be set by repository
			currentPeriod: null,
			todayEntries: 0,
		};
	}

	// Habit-specific methods
	async completeHabit(habitId: string): Promise<{ habit: Habit; log?: HabitLog }> {
		try {
			const habit = typeof this.repository.findById === "function"
				? await this.repository.findById(habitId)
				: (await this.repository.list()).find((h) => h.id === habitId) ?? null;
			if (!habit) {
				throw new Error("Habit not found");
			}

			// Mark as completed
			const completedHabit = await this.update(habitId, {
				status: "Completo",
				lastCompletedDate: new Date().toISOString().split("T")[0]
			});

			// Create log if repository is available
			let log: HabitLog | undefined;
			if (this.habitLogRepository) {
				const completeHabitUseCase = new CompleteHabitUseCase(this.habitLogRepository);
				const logResult = await completeHabitUseCase.execute({ habit });
				log = await this.habitLogRepository.findById(logResult.logId) ?? undefined;
			}

			return { habit: completedHabit, log };
		} catch (error) {
			return handleServiceError(error, "completar hábito");
		}
	}

	async toggleComplete(habitId: string): Promise<Habit> {
		try {
			const habitRepo = this.repository as HabitRepository;
			const useCase = new ToggleCompleteUseCase(habitRepo);
			const result = await useCase.execute(habitId);
			return {
				...result.habit,
				currentPeriod: result.habit.currentPeriod ?? null,
				todayEntries: result.habit.todayEntries ?? 0,
			};
		} catch (error) {
			return handleServiceError(error, "alternar status do hábito");
		}
	}

	async findByStatus(status: Habit["status"]): Promise<Habit[]> {
		try {
			const habits = await this.repository.list();
			return habits.filter((habit) => habit.status === status);
		} catch (error) {
			return handleServiceError(error, "buscar hábitos por status");
		}
	}

	async findByPriority(priority: Habit["priority"]): Promise<Habit[]> {
		try {
			const habits = await this.repository.list();
			return habits.filter((habit) => habit.priority === priority);
		} catch (error) {
			return handleServiceError(error, "buscar hábitos por prioridade");
		}
	}


	async findByTags(tags: string[]): Promise<Habit[]> {
		try {
			const habitRepo = this.repository as HabitRepository;
			return await habitRepo.findByTags(tags);
		} catch (error) {
			return handleServiceError(error, "buscar hábitos por tags");
		}
	}

	async reorderHabits(habitIds: string[]): Promise<void> {
		try {
			const habitRepo = this.repository as HabitRepository;
			await habitRepo.reorder(habitIds);
		} catch (error) {
			return handleServiceError(error, "reordenar hábitos");
		}
	}

	async updateStatus(id: string, status: Habit["status"]): Promise<Habit> {
		try {
			return await this.update(id, { status });
		} catch (error) {
			return handleServiceError(error, "atualizar status do hábito");
		}
	}

	async updatePriority(id: string, priority: Habit["priority"]): Promise<Habit> {
		try {
			return await this.update(id, { priority });
		} catch (error) {
			return handleServiceError(error, "atualizar prioridade do hábito");
		}
	}

}
