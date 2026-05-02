import type { HabitEntry } from "@/domain/entities/habit-entry";
import type { HabitPeriod } from "@/domain/entities/habit-period";
import type { StreakInfo } from "@/domain/services/habit-streak-service";
import type { Habit } from "./types";

export interface HabitRepository {
    list(): Promise<Habit[]>;
    findById(id: string): Promise<Habit | null>;
    findByUserId(userId: string): Promise<Habit[]>;
    create(data: Omit<Habit, "id" | "createdAt" | "updatedAt">): Promise<Habit>;
    update(habit: Habit): Promise<Habit>;
    delete(id: string): Promise<void>;
    toggleComplete(id: string): Promise<Habit>;
    markIncomplete(id: string): Promise<Habit>;
    reorder(ids: string[]): Promise<void>;
    findByTags(tags: string[]): Promise<Habit[]>;
    getTagStats(): Promise<Array<{ tag: string; count: number }>>;
}

export interface HabitPeriodRepo {
    findActiveByHabitId(habitId: string): Promise<HabitPeriod | null>;
    findByHabitId(habitId: string): Promise<HabitPeriod[]>;
    create(data: { habitId: string; periodType: string; startDate: Date }): Promise<HabitPeriod>;
    finalizePeriod(id: string): Promise<HabitPeriod>;
    incrementCount(id: string): Promise<HabitPeriod>;
    findPeriodsToFinalize(): Promise<HabitPeriod[]>;
    update(id: string, data: Partial<HabitPeriod>): Promise<HabitPeriod>;
}

export interface HabitEntryRepo {
    create(data: { habitId: string; periodId: string; note?: string }): Promise<HabitEntry>;
    findByHabitId(habitId: string): Promise<HabitEntry[]>;
    findByHabitIdAndPeriod(habitId: string, periodId: string): Promise<HabitEntry[]>;
    findTodayByHabitId(habitId: string): Promise<HabitEntry[]>;
}

export interface HabitLogRepo {
    create(data: {
        habitId: string;
        habitTitle: string;
        difficulty: string;
        tags: string[];
        completedAt: Date;
    }): Promise<void>;
}

export interface GetAvailableHabitsOutput {
    availableHabits: Habit[];
    completedInCurrentPeriod: Array<Habit & { nextAvailableAt: Date }>;
    totalHabits: number;
}

export interface RegisterHabitOutput {
    entry: HabitEntry;
    currentCount: number;
    target?: number;
    periodType: string;
}

export interface RegisterHabitWithLogOutput {
    entry: HabitEntry;
    currentCount: number;
    todayCount: number;
}

export interface HabitPeriodStats {
    period: HabitPeriod;
    entries: HabitEntry[];
    completionRate: number;
}

export interface GetHabitStatsOutput {
    habitId: string;
    habitTitle: string;
    currentPeriod?: HabitPeriodStats;
    historicalPeriods: HabitPeriodStats[];
    totalEntries: number;
    todayEntries: number;
    averagePerPeriod: number;
    streak: StreakInfo;
}
