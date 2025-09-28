import type { HabitEntry } from "../entities/habit-entry";
import type { HabitPeriod } from "../entities/habit-period";
import type { Habit } from "../entities/habit";

export interface StreakInfo {
	currentStreak: number;
	longestStreak: number;
	lastCompletedDate?: Date;
	isActiveToday: boolean;
}

export class HabitStreakService {
	/**
	 * Calcula o streak atual e o maior streak de um hábito
	 */
	static calculateStreak(
		habit: Habit,
		periods: HabitPeriod[],
		entries: HabitEntry[]
	): StreakInfo {
		if (periods.length === 0) {
			return {
				currentStreak: 0,
				longestStreak: 0,
				isActiveToday: false,
			};
		}

		// Ordenar períodos por data de início (mais recente primeiro)
		const sortedPeriods = periods.sort((a, b) => 
			new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
		);

		// Agrupar entradas por período
		const entriesByPeriod = new Map<string, HabitEntry[]>();
		entries.forEach(entry => {
			const periodEntries = entriesByPeriod.get(entry.periodId) || [];
			periodEntries.push(entry);
			entriesByPeriod.set(entry.periodId, periodEntries);
		});

		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;
		let lastCompletedDate: Date | undefined;
		let isActiveToday = false;

		const today = new Date();
		const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		// Verificar se há atividade hoje
		const todayEntries = entries.filter(entry => {
			const entryDate = new Date(entry.timestamp);
			return entryDate >= todayStart;
		});
		isActiveToday = todayEntries.length > 0;

		// Calcular streaks baseado no tipo de reset do hábito
		for (const period of sortedPeriods) {
			const periodEntries = entriesByPeriod.get(period.id) || [];
			const hasActivity = periodEntries.length > 0;

			if (hasActivity) {
				tempStreak++;
				
				// Atualizar última data de conclusão
				const latestEntry = periodEntries.sort((a, b) => 
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
				)[0];
				
				if (!lastCompletedDate || new Date(latestEntry.timestamp) > lastCompletedDate) {
					lastCompletedDate = new Date(latestEntry.timestamp);
				}
			} else {
				// Se não há atividade no período, quebra o streak atual
				if (tempStreak > longestStreak) {
					longestStreak = tempStreak;
				}
				tempStreak = 0;
			}
		}

		// O streak atual é o tempStreak final (sequência mais recente)
		currentStreak = tempStreak;
		if (tempStreak > longestStreak) {
			longestStreak = tempStreak;
		}



		return {
			currentStreak,
			longestStreak,
			lastCompletedDate,
			isActiveToday,
		};
	}

	/**
	 * Calcula quantos dias se passaram entre duas datas
	 */
	private static getDaysSince(fromDate: Date, toDate: Date): number {
		const diffTime = toDate.getTime() - fromDate.getTime();
		return Math.floor(diffTime / (1000 * 60 * 60 * 24));
	}

	/**
	 * Retorna o número máximo de dias sem atividade antes de quebrar o streak
	 */
	private static getMaxDaysWithoutActivity(resetType: string): number {
		switch (resetType) {
			case "Diariamente":
				return 1; // Deve ter atividade todo dia
			case "Semanalmente":
				return 7; // Pode ficar até 7 dias sem atividade
			case "Mensalmente":
				return 30; // Pode ficar até 30 dias sem atividade
			default:
				return 1;
		}
	}

	/**
	 * Verifica se um período deve ser considerado "completo" para o streak
	 */
	static isPeriodComplete(period: HabitPeriod, entries: HabitEntry[]): boolean {
		if (entries.length === 0) return false;
		
		// Se há uma meta definida, verificar se foi atingida
		if (period.target && period.target > 0) {
			return period.count >= period.target;
		}
		
		// Se não há meta, considerar completo se há pelo menos uma entrada
		return entries.length > 0;
	}

	/**
	 * Calcula o progresso do período atual em relação à meta
	 */
	static calculatePeriodProgress(period: HabitPeriod): number {
		if (!period.target || period.target === 0) return 0;
		return Math.min((period.count / period.target) * 100, 100);
	}
}