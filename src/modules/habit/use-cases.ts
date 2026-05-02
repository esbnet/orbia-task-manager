import { HabitPeriodManager } from "@/domain/services/habit-period-manager";
import { HabitStreakService } from "@/domain/services/habit-streak-service";
import type {
    GetAvailableHabitsOutput,
    GetHabitStatsOutput,
    HabitEntryRepo,
    HabitLogRepo,
    HabitPeriodRepo,
    HabitRepository,
    RegisterHabitOutput,
    RegisterHabitWithLogOutput,
} from "./repository";
import type { CreateHabitInput, Habit, UpdateHabitInput } from "./types";

export async function listHabits(repo: HabitRepository): Promise<Habit[]> {
    return repo.list();
}

export async function createHabit(
    repo: HabitRepository,
    input: CreateHabitInput,
): Promise<Habit> {
    return repo.create({
        userId: input.userId,
        title: input.title,
        observations: input.observations,
        difficulty: input.difficulty,
        status: "Em Andamento",
        priority: input.priority,
        tags: input.tags,
        reset: input.reset,
        order: 0,
        currentPeriod: undefined,
        todayEntries: 0,
    });
}

export async function updateHabit(
    repo: HabitRepository,
    input: UpdateHabitInput,
): Promise<Habit> {
    const existing = await repo.findById(input.id);
    if (!existing) {
        throw new Error(`Hábito com ID ${input.id} não encontrado`);
    }

    return repo.update({
        ...existing,
        ...input,
        updatedAt: new Date(),
    });
}

export async function deleteHabit(
    repo: HabitRepository,
    id: string,
): Promise<void> {
    return repo.delete(id);
}

export async function toggleHabit(
    repo: HabitRepository,
    id: string,
): Promise<Habit> {
    return repo.toggleComplete(id);
}

export async function markHabitIncomplete(
    repo: HabitRepository,
    id: string,
): Promise<Habit> {
    return repo.markIncomplete(id);
}

export async function getAvailableHabits(
    repo: HabitRepository,
    userId: string,
): Promise<GetAvailableHabitsOutput> {
    const allHabits = await repo.findByUserId(userId);
    const availableHabits = allHabits.filter((habit) => habit.status === "Em Andamento");

    return {
        availableHabits,
        completedInCurrentPeriod: [],
        totalHabits: availableHabits.length,
    };
}

export async function archiveHabit(
    repo: HabitRepository,
    id: string,
): Promise<void> {
    const habit = await repo.findById(id);
    if (!habit) throw new Error("Hábito não encontrado");
    await repo.update({ ...habit, status: "archived" });
}

export async function reorderHabits(
    repo: HabitRepository,
    ids: string[],
): Promise<void> {
    return repo.reorder(ids);
}

export async function findHabitsByTags(
    repo: HabitRepository,
    tags: string[],
): Promise<Habit[]> {
    return repo.findByTags(tags);
}

export async function getHabitTagStats(
    repo: HabitRepository,
): Promise<Array<{ tag: string; count: number }>> {
    return repo.getTagStats();
}

function mapResetToPeriodType(
    reset: string,
): "Diariamente" | "Semanalmente" | "Mensalmente" {
    switch (reset) {
        case "Semanalmente":
            return "Semanalmente";
        case "Mensalmente":
            return "Mensalmente";
        default:
            return "Diariamente";
    }
}

function shouldCreateNewPeriod(period: { periodType: string; startDate: Date }): boolean {
    const now = new Date();
    const start = new Date(period.startDate);
    switch (period.periodType) {
        case "Diariamente":
            return now.toDateString() !== start.toDateString();
        case "Semanalmente": {
            const weekDiff = Math.floor(
                (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000),
            );
            return weekDiff >= 1;
        }
        case "Mensalmente":
            return (
                now.getMonth() !== start.getMonth() ||
                now.getFullYear() !== start.getFullYear()
            );
        default:
            return false;
    }
}

export async function registerHabit(
    habitRepo: HabitRepository,
    periodRepo: HabitPeriodRepo,
    entryRepo: HabitEntryRepo,
    input: { habitId: string; note?: string },
): Promise<RegisterHabitOutput> {
    const habit = await habitRepo.findById(input.habitId);
    if (!habit) throw new Error("Hábito não encontrado");

    let activePeriod = await periodRepo.findActiveByHabitId(input.habitId);
    if (!activePeriod) {
        activePeriod = await periodRepo.create({
            habitId: input.habitId,
            periodType: mapResetToPeriodType(habit.reset),
            startDate: new Date(),
        });
    }

    if (shouldCreateNewPeriod(activePeriod)) {
        await periodRepo.finalizePeriod(activePeriod.id);
        activePeriod = await periodRepo.create({
            habitId: input.habitId,
            periodType: mapResetToPeriodType(habit.reset),
            startDate: new Date(),
        });
    }

    const entry = await entryRepo.create({
        habitId: input.habitId,
        periodId: activePeriod.id,
        note: input.note,
    });

    const updatedPeriod = await periodRepo.incrementCount(activePeriod.id);

    return {
        entry,
        currentCount: updatedPeriod.count,
        target: updatedPeriod.target,
        periodType: updatedPeriod.periodType,
    };
}

export async function registerHabitWithLog(
    habitRepo: HabitRepository,
    periodRepo: HabitPeriodRepo,
    entryRepo: HabitEntryRepo,
    logRepo: HabitLogRepo,
    input: { habitId: string; note?: string },
): Promise<RegisterHabitWithLogOutput> {
    const habit = await habitRepo.findById(input.habitId);
    if (!habit) throw new Error("Hábito não encontrado");

    let activePeriod = await periodRepo.findActiveByHabitId(input.habitId);
    if (!activePeriod) {
        activePeriod = await periodRepo.create({
            habitId: input.habitId,
            periodType: mapResetToPeriodType(habit.reset),
            startDate: new Date(),
        });
    }

    if (shouldCreateNewPeriod(activePeriod)) {
        await periodRepo.finalizePeriod(activePeriod.id);
        activePeriod = await periodRepo.create({
            habitId: input.habitId,
            periodType: mapResetToPeriodType(habit.reset),
            startDate: new Date(),
        });
    }

    const entry = await entryRepo.create({
        habitId: input.habitId,
        periodId: activePeriod.id,
        note: input.note,
    });

    await logRepo.create({
        habitId: habit.id,
        habitTitle: habit.title,
        difficulty: habit.difficulty,
        tags: habit.tags,
        completedAt: new Date(),
    });

    const updatedPeriod = await periodRepo.incrementCount(activePeriod.id);
    const todayEntries = await entryRepo.findTodayByHabitId(input.habitId);

    return {
        entry,
        currentCount: updatedPeriod.count,
        todayCount: todayEntries.length,
    };
}

export async function getHabitStats(
    habitRepo: HabitRepository,
    periodRepo: HabitPeriodRepo,
    entryRepo: HabitEntryRepo,
    habitId: string,
): Promise<GetHabitStatsOutput> {
    const habit = await habitRepo.findById(habitId);
    if (!habit) throw new Error("Hábito não encontrado");

    const allPeriods = await periodRepo.findByHabitId(habitId);
    const todayEntries = await entryRepo.findTodayByHabitId(habitId);

    const periodStats = [];
    let currentPeriod = undefined;

    for (const period of allPeriods) {
        const entries = await entryRepo.findByHabitIdAndPeriod(habitId, period.id);
        const completionRate = period.target
            ? Math.min((period.count / period.target) * 100, 100)
            : 0;
        const stats = { period, entries, completionRate };
        if (period.isActive) {
            currentPeriod = stats;
        } else {
            periodStats.push(stats);
        }
    }

    const totalEntries = allPeriods.reduce((sum, p) => sum + p.count, 0);
    const averagePerPeriod = allPeriods.length > 0 ? totalEntries / allPeriods.length : 0;
    const allEntries = await entryRepo.findByHabitId(habitId);
    const streak = HabitStreakService.calculateStreak(habit as never, allPeriods, allEntries);

    return {
        habitId,
        habitTitle: habit.title,
        currentPeriod,
        historicalPeriods: periodStats,
        totalEntries,
        todayEntries: todayEntries.length,
        averagePerPeriod: Math.round(averagePerPeriod * 100) / 100,
        streak,
    };
}

export async function cleanupHabitPeriods(
    periodRepo: HabitPeriodRepo,
): Promise<void> {
    const manager = new HabitPeriodManager(periodRepo as never);
    await manager.finalizeExpiredPeriods();
}
