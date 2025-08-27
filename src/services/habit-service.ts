import type { HabitLogRepository, HabitRepository } from "@/domain/repositories/all-repository";
import { BaseEntityService, handleServiceError } from "./base/entity-service";

import type { Habit } from "@/domain/entities/habit";
import type { HabitLog } from "@/domain/entities/habit-log";

// Habit form data interface
export interface HabitFormData {
	title: string;
	observations: string;
	difficulty: Habit["difficulty"];
	priority: Habit["priority"];
	category: Habit["category"];
	tags: string[];
	reset: Habit["reset"];
}

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
			category: data.category,
			tags: data.tags,
			reset: data.reset,
			userId: "", // Will be set by repository
			order: 0, // Will be set by repository
		};
	}

	// Habit-specific methods
	async completeHabit(habitId: string): Promise<{ habit: Habit; log?: HabitLog }> {
		try {
			// Get current habit
			const habits = await this.repository.list();
			const habit = habits.find((h) => h.id === habitId);
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
				log = await this.habitLogRepository.create({
					habitId: habit.id,
					habitTitle: habit.title,
					difficulty: habit.difficulty,
					tags: habit.tags,
					completedAt: new Date(),
				});
			}

			return { habit: completedHabit, log };
		} catch (error) {
			return handleServiceError(error, "completar hábito");
		}
	}

	async toggleComplete(habitId: string): Promise<Habit> {
		try {
			const habitRepo = this.repository as HabitRepository;
			return await habitRepo.toggleComplete(habitId);
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

	async findByCategory(category: Habit["category"]): Promise<Habit[]> {
		try {
			const habits = await this.repository.list();
			return habits.filter((habit) => habit.category === category);
		} catch (error) {
			return handleServiceError(error, "buscar hábitos por categoria");
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

	async updateCategory(id: string, category: Habit["category"]): Promise<Habit> {
		try {
			return await this.update(id, { category });
		} catch (error) {
			return handleServiceError(error, "atualizar categoria do hábito");
		}
	}
}
