import type { HabitPeriod } from "../entities/habit-period";
import type { HabitPeriodRepository } from "../repositories/habit-period-repository";

export class HabitPeriodManager {
	constructor(private habitPeriodRepository: HabitPeriodRepository) {}

	/**
	 * Finaliza períodos expirados e cria novos períodos ativos
	 */
	async finalizeExpiredPeriods(): Promise<void> {
		const expiredPeriods = await this.habitPeriodRepository.findPeriodsToFinalize();
		
		for (const period of expiredPeriods) {
			await this.habitPeriodRepository.finalizePeriod(period.id);
		}
	}

	/**
	 * Verifica se um período deve ser finalizado baseado no tipo e data de início
	 */
	shouldFinalizePeriod(period: HabitPeriod): boolean {
		const now = new Date();
		const startDate = new Date(period.startDate);
		const timeDiff = now.getTime() - startDate.getTime();

		switch (period.periodType) {
			case "Diariamente":
				// Finalizar se passou de 1 dia
				return timeDiff > 24 * 60 * 60 * 1000;
			
			case "Semanalmente":
				// Finalizar se passou de 7 dias
				return timeDiff > 7 * 24 * 60 * 60 * 1000;
			
			case "Mensalmente":
				// Finalizar se passou de 30 dias
				return timeDiff > 30 * 24 * 60 * 60 * 1000;
			
			default:
				return false;
		}
	}

	/**
	 * Calcula a próxima data de disponibilidade para um hábito
	 */
	getNextAvailableDate(period: HabitPeriod): Date {
		const startDate = new Date(period.startDate);
		
		switch (period.periodType) {
			case "Diariamente":
				return new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
			
			case "Semanalmente":
				return new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
			
			case "Mensalmente":
				return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
			
			default:
				return new Date();
		}
	}
}