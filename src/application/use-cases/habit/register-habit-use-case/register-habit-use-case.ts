import type { HabitEntry } from "@/domain/entities/habit-entry";
import type { HabitPeriod } from "@/domain/entities/habit-period";
import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { HabitEntryRepository } from "@/domain/repositories/habit-entry-repository";
import type { HabitPeriodRepository } from "@/domain/repositories/habit-period-repository";

export interface RegisterHabitInput {
	habitId: string;
	note?: string;
}

export interface RegisterHabitOutput {
	entry: HabitEntry;
	currentCount: number;
	target?: number;
	periodType: string;
}

export class RegisterHabitUseCase {
	constructor(
		private habitRepository: HabitRepository,
		private habitPeriodRepository: HabitPeriodRepository,
		private habitEntryRepository: HabitEntryRepository,
	) {}

	async execute(input: RegisterHabitInput): Promise<RegisterHabitOutput> {
		// 1. Verificar se o hábito existe
		const habit = await this.habitRepository.findById(input.habitId);
		if (!habit) {
			throw new Error("Hábito não encontrado");
		}

		// 2. Buscar período ativo ou criar um novo
		let activePeriod = await this.habitPeriodRepository.findActiveByHabitId(input.habitId);
		
		if (!activePeriod) {
			// Criar novo período baseado no reset do hábito
			activePeriod = await this.habitPeriodRepository.create({
				habitId: input.habitId,
				periodType: habit.reset,
				startDate: new Date(),
			});
		}

		// 3. Verificar se o período atual ainda é válido
		const shouldCreateNewPeriod = this.shouldCreateNewPeriod(activePeriod);
		
		if (shouldCreateNewPeriod) {
			// Finalizar período atual
			await this.habitPeriodRepository.finalizePeriod(activePeriod.id);
			
			// Criar novo período
			activePeriod = await this.habitPeriodRepository.create({
				habitId: input.habitId,
				periodType: habit.reset,
				startDate: new Date(),
			});
		}

		// 4. Criar entrada de registro
		const entry = await this.habitEntryRepository.create({
			habitId: input.habitId,
			periodId: activePeriod.id,
			note: input.note,
		});

		// 5. Incrementar contador do período
		const updatedPeriod = await this.habitPeriodRepository.incrementCount(activePeriod.id);

		return {
			entry,
			currentCount: updatedPeriod.count,
			target: updatedPeriod.target,
			periodType: updatedPeriod.periodType,
		};
	}

	private shouldCreateNewPeriod(period: HabitPeriod): boolean {
		const now = new Date();
		const startDate = new Date(period.startDate);
		
		switch (period.periodType) {
			case "Diariamente":
				// Novo período se passou de 1 dia
				return now.getTime() - startDate.getTime() > 24 * 60 * 60 * 1000;
			
			case "Semanalmente":
				// Novo período se passou de 7 dias
				return now.getTime() - startDate.getTime() > 7 * 24 * 60 * 60 * 1000;
			
			case "Mensalmente":
				// Novo período se passou de 30 dias
				return now.getTime() - startDate.getTime() > 30 * 24 * 60 * 60 * 1000;
			
			default:
				return false;
		}
	}
}
