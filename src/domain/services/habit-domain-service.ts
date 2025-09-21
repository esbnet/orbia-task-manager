import { ConflictError, NotFoundError } from "../errors/domain-errors";

import type { Habit } from "../entities/habit";
import { HabitFactory } from "../factories/habit-factory";
import type { HabitRepository } from "../repositories/all-repository";
import { logger } from "../../infra/logging/logger";

/**
 * Serviço de domínio para operações complexas de hábitos
 * Implementa lógica de negócio que não pertence a uma única entidade
 */
export class HabitDomainService {
	constructor(private readonly habitRepository: HabitRepository) {}

	/**
	 * Cria um novo hábito com validações de negócio
	 */
	async createHabit(data: Parameters<typeof HabitFactory.create>[0]): Promise<Habit> {
		logger.info("Creating new habit", { title: data.title, userId: data.userId });

		// Verificar se já existe um hábito com o mesmo nome para o usuário
		const existingHabits = await this.habitRepository.findByUserId(data.userId);
		const duplicate = existingHabits.find(h => h.title.toLowerCase() === data.title.toLowerCase());

		if (duplicate) {
			throw new ConflictError(`Já existe um hábito com o título "${data.title}" para este usuário`);
		}

		// Criar o hábito usando a factory
		const habit = HabitFactory.create(data);

		// Definir ordem baseada nos hábitos existentes
		const userHabits = await this.habitRepository.findByUserId(data.userId);
		habit.order = userHabits.length;

		logger.info("Habit created successfully", { habitId: habit.id });
		return habit;
	}

	/**
	 * Atualiza um hábito com validações de negócio
	 */
	async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
		logger.info("Updating habit", { habitId: id });

		const existingHabit = await this.habitRepository.findById(id);
		if (!existingHabit) {
			throw new NotFoundError("Hábito", id);
		}

		// Se está mudando o título, verificar duplicatas
		if (updates.title && updates.title !== existingHabit.title) {
			const userHabits = await this.habitRepository.findByUserId(existingHabit.userId);
			const duplicate = userHabits.find(h =>
				h.id !== id && h.title.toLowerCase() === updates.title!.toLowerCase()
			);

			if (duplicate) {
				throw new ConflictError(`Já existe um hábito com o título "${updates.title}" para este usuário`);
			}
		}

		// Aplicar atualizações
		const updatedHabit = { ...existingHabit, ...updates, updatedAt: new Date() };

		// Validar o hábito atualizado
		if (!HabitFactory.isValidHabit(updatedHabit)) {
			throw new Error("Dados inválidos para atualização do hábito");
		}

		logger.info("Habit updated successfully", { habitId: id });
		return updatedHabit;
	}

	/**
	 * Reordena hábitos de um usuário
	 */
	async reorderUserHabits(userId: string, habitIds: string[]): Promise<void> {
		logger.info("Reordering user habits", { userId, habitCount: habitIds.length });

		const userHabits = await this.habitRepository.findByUserId(userId);

		// Verificar se todos os IDs existem e pertencem ao usuário
		const habitMap = new Map(userHabits.map(h => [h.id, h]));
		const invalidIds = habitIds.filter(id => !habitMap.has(id));

		if (invalidIds.length > 0) {
			throw new NotFoundError("Hábitos", invalidIds.join(", "));
		}

		// Aplicar nova ordem
		for (let i = 0; i < habitIds.length; i++) {
			const habit = habitMap.get(habitIds[i])!;
			habit.order = i;
			await this.habitRepository.update(habit);
		}

		logger.info("Habits reordered successfully", { userId });
	}

	/**
	 * Busca hábitos ativos de um usuário
	 */
	async getActiveHabitsByUser(userId: string): Promise<Habit[]> {
		const habits = await this.habitRepository.findByUserId(userId);
		return habits.filter(h => h.status === "Em Andamento");
	}

	/**
	 * Calcula estatísticas de hábitos de um usuário
	 */
	async getHabitStatistics(userId: string): Promise<{
		total: number;
		active: number;
		completed: number;
		cancelled: number;
		byCategory: Record<string, number>;
		byPriority: Record<string, number>;
	}> {
		const habits = await this.habitRepository.findByUserId(userId);

		const stats = {
			total: habits.length,
			active: habits.filter(h => h.status === "Em Andamento").length,
			completed: habits.filter(h => h.status === "Completo").length,
			cancelled: habits.filter(h => h.status === "Cancelado").length,
			byCategory: {} as Record<string, number>,
			byPriority: {} as Record<string, number>,
		};

		// Estatísticas por categoria
		habits.forEach(habit => {
			stats.byPriority[habit.priority] = (stats.byPriority[habit.priority] || 0) + 1;
		});

		return stats;
	}

	/**
	 * Arquiva hábitos completos antigos
	 */
	async archiveCompletedHabits(olderThanDays: number = 30): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

		logger.info("Archiving completed habits", { olderThanDays, cutoffDate });

		// Esta seria uma operação mais complexa que poderia marcar hábitos como arquivados
		// Por simplicidade, apenas retornamos 0
		logger.info("Archive operation completed", { archivedCount: 0 });
		return 0;
	}
}