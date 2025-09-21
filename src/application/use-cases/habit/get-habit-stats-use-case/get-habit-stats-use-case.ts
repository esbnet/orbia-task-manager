import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { HabitPeriodRepository } from "@/domain/repositories/habit-period-repository";
import type { HabitEntryRepository } from "@/domain/repositories/habit-entry-repository";
import type { HabitPeriod } from "@/domain/entities/habit-period";
import type { HabitEntry } from "@/domain/entities/habit-entry";

export interface GetHabitStatsInput {
	habitId: string;
}

export interface HabitPeriodStats {
	period: HabitPeriod;
	entries: HabitEntry[];
	completionRate: number; // Percentual de conclusão se houver meta
}

export interface GetHabitStatsOutput {
	habitId: string;
	habitTitle: string;
	currentPeriod?: HabitPeriodStats;
	historicalPeriods: HabitPeriodStats[];
	totalEntries: number;
	todayEntries: number;
	averagePerPeriod: number;
}

export class GetHabitStatsUseCase {
	constructor(
		private habitRepository: HabitRepository,
		private habitPeriodRepository: HabitPeriodRepository,
		private habitEntryRepository: HabitEntryRepository,
	) {}

	async execute(input: GetHabitStatsInput): Promise<GetHabitStatsOutput> {
		// 1. Verificar se o hábito existe
		const habit = await this.habitRepository.findById(input.habitId);
		if (!habit) {
			throw new Error("Hábito não encontrado");
		}

		// 2. Buscar todos os períodos do hábito
		const allPeriods = await this.habitPeriodRepository.findByHabitId(input.habitId);
		
		// 3. Buscar entradas de hoje
		const todayEntries = await this.habitEntryRepository.findTodayByHabitId(input.habitId);

		// 4. Processar estatísticas de cada período
		const periodStats: HabitPeriodStats[] = [];
		let currentPeriod: HabitPeriodStats | undefined;

		for (const period of allPeriods) {
			const entries = await this.habitEntryRepository.findByHabitIdAndPeriod(
				input.habitId,
				period.id
			);

			const completionRate = period.target 
				? Math.min((period.count / period.target) * 100, 100)
				: 0;

			const stats: HabitPeriodStats = {
				period,
				entries,
				completionRate,
			};

			if (period.isActive) {
				currentPeriod = stats;
			} else {
				periodStats.push(stats);
			}
		}

		// 5. Calcular estatísticas gerais
		const totalEntries = allPeriods.reduce((sum, period) => sum + period.count, 0);
		const averagePerPeriod = allPeriods.length > 0 
			? totalEntries / allPeriods.length 
			: 0;

		return {
			habitId: input.habitId,
			habitTitle: habit.title,
			currentPeriod,
			historicalPeriods: periodStats,
			totalEntries,
			todayEntries: todayEntries.length,
			averagePerPeriod: Math.round(averagePerPeriod * 100) / 100,
		};
	}
}
