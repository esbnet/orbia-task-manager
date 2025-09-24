import { HabitStreakService } from "../habit-streak-service";
import type { Habit } from "../../entities/habit";
import type { HabitPeriod } from "../../entities/habit-period";
import type { HabitEntry } from "../../entities/habit-entry";

describe("HabitStreakService", () => {
	const mockHabit: Habit = {
		id: "habit-1",
		userId: "user-1",
		title: "Test Habit",
		observations: "",
		difficulty: "Fácil",
		status: "Em Andamento",
		priority: "Média",
		tags: [],
		reset: "Diariamente",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-01"),
		currentPeriod: null,
		todayEntries: 0,
	};

	it("should calculate streak correctly for daily habit", () => {
		const periods: HabitPeriod[] = [
			{
				id: "period-1",
				habitId: "habit-1",
				periodType: "Diariamente",
				startDate: new Date("2024-01-01"),
				count: 1,
				isActive: false,
				createdAt: new Date("2024-01-01"),
				updatedAt: new Date("2024-01-01"),
			},
			{
				id: "period-2",
				habitId: "habit-1",
				periodType: "Diariamente",
				startDate: new Date("2024-01-02"),
				count: 1,
				isActive: false,
				createdAt: new Date("2024-01-02"),
				updatedAt: new Date("2024-01-02"),
			},
			{
				id: "period-3",
				habitId: "habit-1",
				periodType: "Diariamente",
				startDate: new Date("2024-01-03"),
				count: 1,
				isActive: true,
				createdAt: new Date("2024-01-03"),
				updatedAt: new Date("2024-01-03"),
			},
		];

		const entries: HabitEntry[] = [
			{
				id: "entry-1",
				habitId: "habit-1",
				periodId: "period-1",
				timestamp: new Date("2024-01-01T10:00:00"),
				createdAt: new Date("2024-01-01T10:00:00"),
			},
			{
				id: "entry-2",
				habitId: "habit-1",
				periodId: "period-2",
				timestamp: new Date("2024-01-02T10:00:00"),
				createdAt: new Date("2024-01-02T10:00:00"),
			},
			{
				id: "entry-3",
				habitId: "habit-1",
				periodId: "period-3",
				timestamp: new Date("2024-01-03T10:00:00"),
				createdAt: new Date("2024-01-03T10:00:00"),
			},
		];

		const streak = HabitStreakService.calculateStreak(mockHabit, periods, entries);

		expect(streak.currentStreak).toBe(3);
		expect(streak.longestStreak).toBe(3);
		expect(streak.lastCompletedDate).toEqual(new Date("2024-01-03T10:00:00"));
	});

	it("should return zero streak for habit with no entries", () => {
		const periods: HabitPeriod[] = [];
		const entries: HabitEntry[] = [];

		const streak = HabitStreakService.calculateStreak(mockHabit, periods, entries);

		expect(streak.currentStreak).toBe(0);
		expect(streak.longestStreak).toBe(0);
		expect(streak.lastCompletedDate).toBeUndefined();
		expect(streak.isActiveToday).toBe(false);
	});

	it("should break streak when there's a gap", () => {
		const periods: HabitPeriod[] = [
			{
				id: "period-1",
				habitId: "habit-1",
				periodType: "Diariamente",
				startDate: new Date("2024-01-01"),
				count: 1,
				isActive: false,
				createdAt: new Date("2024-01-01"),
				updatedAt: new Date("2024-01-01"),
			},
			{
				id: "period-2",
				habitId: "habit-1",
				periodType: "Diariamente",
				startDate: new Date("2024-01-02"),
				count: 0, // No activity
				isActive: false,
				createdAt: new Date("2024-01-02"),
				updatedAt: new Date("2024-01-02"),
			},
			{
				id: "period-3",
				habitId: "habit-1",
				periodType: "Diariamente",
				startDate: new Date("2024-01-03"),
				count: 1,
				isActive: true,
				createdAt: new Date("2024-01-03"),
				updatedAt: new Date("2024-01-03"),
			},
		];

		const entries: HabitEntry[] = [
			{
				id: "entry-1",
				habitId: "habit-1",
				periodId: "period-1",
				timestamp: new Date("2024-01-01T10:00:00"),
				createdAt: new Date("2024-01-01T10:00:00"),
			},
			{
				id: "entry-3",
				habitId: "habit-1",
				periodId: "period-3",
				timestamp: new Date("2024-01-03T10:00:00"),
				createdAt: new Date("2024-01-03T10:00:00"),
			},
		];

		const streak = HabitStreakService.calculateStreak(mockHabit, periods, entries);

		expect(streak.currentStreak).toBe(1); // Only current period
		expect(streak.longestStreak).toBe(1); // Longest was also 1
	});

	it("should calculate period progress correctly", () => {
		const period: HabitPeriod = {
			id: "period-1",
			habitId: "habit-1",
			periodType: "Diariamente",
			startDate: new Date("2024-01-01"),
			count: 3,
			target: 5,
			isActive: true,
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		const progress = HabitStreakService.calculatePeriodProgress(period);
		expect(progress).toBe(60); // 3/5 * 100 = 60%
	});

	it("should return 0 progress when no target is set", () => {
		const period: HabitPeriod = {
			id: "period-1",
			habitId: "habit-1",
			periodType: "Diariamente",
			startDate: new Date("2024-01-01"),
			count: 3,
			isActive: true,
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		const progress = HabitStreakService.calculatePeriodProgress(period);
		expect(progress).toBe(0);
	});
});