import { eachDayOfInterval, endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";

import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { HabitEntryRepository } from "@/domain/repositories/habit-entry-repository";
import type { HabitPeriodRepository } from "@/domain/repositories/habit-period-repository";

export interface GetHabitsAnalyticsInput {
	timeRange: "week" | "month" | "quarter" | "year";
}

export interface GetHabitsAnalyticsOutput {
	totalHabits: number;
	activeHabits: number;
	completedHabits: number;
	totalEntries: number;
	completionRate: number;
	currentStreaks: Array<{
		habitId: string;
		habitTitle: string;
		streakDays: number;
		lastEntry: string;
	}>;
	dailyProgress: Array<{
		date: string;
		entries: number;
		target: number;
		completionRate: number;
	}>;
	weeklyTrends: Array<{
		week: string;
		totalEntries: number;
		uniqueHabits: number;
		completionRate: number;
	}>;
	habitsByCategory: Array<{
		category: string;
		count: number;
		completionRate: number;
	}>;
	habitsByDifficulty: Array<{
		difficulty: string;
		count: number;
		completionRate: number;
	}>;
}

export class GetHabitsAnalyticsUseCase {
	constructor(
		private habitRepository: HabitRepository,
		private habitPeriodRepository: HabitPeriodRepository,
		private habitEntryRepository: HabitEntryRepository,
	) {}

	async execute(input: GetHabitsAnalyticsInput): Promise<GetHabitsAnalyticsOutput> {
		const now = new Date();
		const { startDate, endDate } = this.getDateRange(input.timeRange, now);

		// Buscar todos os hábitos do usuário
		const allHabits = await this.habitRepository.list();

		// Filtrar hábitos no período
		const habitsInPeriod = allHabits.filter(habit =>
			habit.createdAt >= startDate || habit.updatedAt >= startDate
		);

		const totalHabits = habitsInPeriod.length;
		const activeHabits = habitsInPeriod.filter(h => h.status === "Em Andamento").length;
		const completedHabits = habitsInPeriod.filter(h => h.status === "Completo").length;

		// Buscar todas as entradas dos hábitos no período
		let totalEntries = 0;
		for (const habit of allHabits) {
			const entries = await this.habitEntryRepository.findByHabitId(habit.id);
			const entriesInPeriod = entries.filter(entry =>
				entry.timestamp >= startDate && entry.timestamp <= endDate
			);
			totalEntries += entriesInPeriod.length;
		}

		// Calcular taxa de conclusão geral
		const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

		// Calcular streaks atuais
		const currentStreaks = await this.calculateCurrentStreaks(allHabits);

		// Calcular progresso diário
		const dailyProgress = await this.calculateDailyProgress(startDate, endDate, allHabits);

		// Calcular tendências semanais
		const weeklyTrends = await this.calculateWeeklyTrends(input.timeRange, now, allHabits);

		// Agrupar hábitos por categoria
		const habitsByCategory = this.groupHabitsByCategory(habitsInPeriod);

		// Agrupar hábitos por dificuldade
		const habitsByDifficulty = this.groupHabitsByDifficulty(habitsInPeriod);

		return {
			totalHabits,
			activeHabits,
			completedHabits,
			totalEntries,
			completionRate,
			currentStreaks,
			dailyProgress,
			weeklyTrends,
			habitsByCategory,
			habitsByDifficulty,
		};
	}

	private getDateRange(timeRange: string, now: Date): { startDate: Date; endDate: Date } {
		switch (timeRange) {
			case "week":
				return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
			case "month":
				return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
			case "quarter":
				const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
				const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
				return { startDate: quarterStart, endDate: quarterEnd };
			case "year":
				return { startDate: startOfYear(now), endDate: endOfYear(now) };
			default:
				return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
		}
	}

	private async calculateCurrentStreaks(habits: any[]): Promise<Array<{
		habitId: string;
		habitTitle: string;
		streakDays: number;
		lastEntry: string;
	}>> {
		const streaks: Array<{
			habitId: string;
			habitTitle: string;
			streakDays: number;
			lastEntry: string;
		}> = [];

		for (const habit of habits) {
			const entries = await this.habitEntryRepository.findByHabitId(habit.id);
			if (entries.length === 0) continue;

			// Calcular streak atual (dias consecutivos)
			const sortedEntries = entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
			let streakDays = 0;
			let currentDate = new Date();

			for (const entry of sortedEntries) {
				const entryDate = startOfDay(entry.timestamp);
				const expectedDate = startOfDay(currentDate);

				if (entryDate.getTime() === expectedDate.getTime()) {
					streakDays++;
					currentDate.setDate(currentDate.getDate() - 1);
				} else {
					break;
				}
			}

			if (streakDays > 0) {
				streaks.push({
					habitId: habit.id,
					habitTitle: habit.title,
					streakDays,
					lastEntry: sortedEntries[0].timestamp.toISOString(),
				});
			}
		}

		return streaks.sort((a, b) => b.streakDays - a.streakDays).slice(0, 5); // Top 5
	}

	private async calculateDailyProgress(startDate: Date, endDate: Date, habits: any[]): Promise<Array<{
		date: string;
		entries: number;
		target: number;
		completionRate: number;
	}>> {
		const days = eachDayOfInterval({ start: startDate, end: endDate });
		const dailyProgress: Array<{
			date: string;
			entries: number;
			target: number;
			completionRate: number;
		}> = [];

		for (const day of days) {
			let entriesCount = 0;

			// Contar entradas para cada hábito no dia
			for (const habit of habits) {
				const entries = await this.habitEntryRepository.findByHabitId(habit.id);
				const dayEntries = entries.filter(entry =>
					entry.timestamp.toDateString() === day.toDateString()
				);
				entriesCount += dayEntries.length;
			}

			// Meta simples: 1 entrada por hábito ativo
			const target = habits.filter(h => h.status === "Em Andamento").length;
			const completionRate = target > 0 ? Math.min((entriesCount / target) * 100, 100) : 0;

			dailyProgress.push({
				date: format(day, "yyyy-MM-dd"),
				entries: entriesCount,
				target,
				completionRate,
			});
		}

		return dailyProgress;
	}

	private async calculateWeeklyTrends(timeRange: string, now: Date, habits: any[]): Promise<Array<{
		week: string;
		totalEntries: number;
		uniqueHabits: number;
		completionRate: number;
	}>> {
		const weeks: Array<{
			week: string;
			totalEntries: number;
			uniqueHabits: number;
			completionRate: number;
		}> = [];

		const weeksCount = timeRange === "month" ? 4 : timeRange === "quarter" ? 12 : 52;

		for (let i = weeksCount - 1; i >= 0; i--) {
			const weekStart = startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7)));
			const weekEnd = endOfWeek(weekStart);

			let totalEntries = 0;
			const uniqueHabitsSet = new Set<string>();

			// Contar entradas para cada hábito na semana
			for (const habit of habits) {
				const entries = await this.habitEntryRepository.findByHabitId(habit.id);
				const weekEntries = entries.filter(entry =>
					entry.timestamp >= weekStart && entry.timestamp <= weekEnd
				);
				totalEntries += weekEntries.length;
				if (weekEntries.length > 0) {
					uniqueHabitsSet.add(habit.id);
				}
			}

			const activeHabits = habits.filter(h => h.status === "Em Andamento").length;
			const target = activeHabits * 7; // Meta semanal
			const completionRate = target > 0 ? Math.min((totalEntries / target) * 100, 100) : 0;

			weeks.push({
				week: format(weekStart, "MMM dd"),
				totalEntries,
				uniqueHabits: uniqueHabitsSet.size,
				completionRate,
			});
		}

		return weeks;
	}

	private groupHabitsByCategory(habits: any[]): Array<{
		category: string;
		count: number;
		completionRate: number;
	}> {
		const categoryMap = new Map<string, { count: number; completed: number }>();

		for (const habit of habits) {
			const category = habit.category || "Sem categoria";
			const current = categoryMap.get(category) || { count: 0, completed: 0 };
			current.count++;
			if (habit.status === "Completo") {
				current.completed++;
			}
			categoryMap.set(category, current);
		}

		return Array.from(categoryMap.entries()).map(([category, data]) => ({
			category,
			count: data.count,
			completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
		}));
	}

	private groupHabitsByDifficulty(habits: any[]): Array<{
		difficulty: string;
		count: number;
		completionRate: number;
	}> {
		const difficultyMap = new Map<string, { count: number; completed: number }>();

		for (const habit of habits) {
			const difficulty = habit.difficulty || "Não definido";
			const current = difficultyMap.get(difficulty) || { count: 0, completed: 0 };
			current.count++;
			if (habit.status === "Completo") {
				current.completed++;
			}
			difficultyMap.set(difficulty, current);
		}

		return Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
			difficulty,
			count: data.count,
			completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
		}));
	}
}