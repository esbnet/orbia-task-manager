import type { GetHabitsAnalyticsOutput } from "@/application/use-cases/habit/get-habits-analytics-use-case/get-habits-analytics-use-case";
import { GetHabitsAnalyticsUseCase } from "@/application/use-cases/habit/get-habits-analytics-use-case/get-habits-analytics-use-case";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitLogRepository } from "@/infra/database/prisma/prisma-habit-log-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
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
import {
    archiveHabit,
    cleanupHabitPeriods,
    createHabit,
    deleteHabit,
    findHabitsByTags,
    getAvailableHabits,
    getHabitStats,
    getHabitTagStats,
    listHabits,
    markHabitIncomplete,
    registerHabit,
    registerHabitWithLog,
    reorderHabits,
    toggleHabit,
    updateHabit,
} from "./use-cases";

const _habitRepo = new PrismaHabitRepository();
const _periodRepo = new PrismaHabitPeriodRepository();
const _entryRepo = new PrismaHabitEntryRepository();
const _logRepo = new PrismaHabitLogRepository();

const habitRepo: HabitRepository = {
    list() { return _habitRepo.list(); },
    findById(id) { return _habitRepo.findById(id); },
    findByUserId(userId) { return _habitRepo.findByUserId(userId); },
    create(data) { return _habitRepo.create(data); },
    update(habit) { return _habitRepo.update(habit); },
    delete(id) { return _habitRepo.delete(id); },
    toggleComplete(id) { return _habitRepo.toggleComplete(id); },
    markIncomplete(id) { return _habitRepo.markIncomplete(id); },
    reorder(ids) { return _habitRepo.reorder(ids); },
    findByTags(tags) { return _habitRepo.findByTags(tags); },
    getTagStats() { return _habitRepo.getTagStats(); },
};

const periodRepo: HabitPeriodRepo = {
    findActiveByHabitId(habitId) { return _periodRepo.findActiveByHabitId(habitId); },
    findByHabitId(habitId) { return _periodRepo.findByHabitId(habitId); },
    create(data) { return _periodRepo.create(data as never); },
    finalizePeriod(id) { return _periodRepo.finalizePeriod(id); },
    incrementCount(id) { return _periodRepo.incrementCount(id); },
    findPeriodsToFinalize() { return _periodRepo.findPeriodsToFinalize(); },
    update(id, data) { return _periodRepo.update(id, data as never); },
};

const entryRepo: HabitEntryRepo = {
    create(data) { return _entryRepo.create(data); },
    findByHabitId(habitId) { return _entryRepo.findByHabitId(habitId); },
    findByHabitIdAndPeriod(habitId, periodId) { return _entryRepo.findByHabitIdAndPeriod(habitId, periodId); },
    findTodayByHabitId(habitId) { return _entryRepo.findTodayByHabitId(habitId); },
};

const logRepo: HabitLogRepo = {
    create(data) { return _logRepo.create(data as never).then(() => undefined); },
};

export const HabitModule = {
    list(): Promise<Habit[]> {
        return listHabits(habitRepo);
    },
    create(input: CreateHabitInput): Promise<Habit> {
        return createHabit(habitRepo, input);
    },
    update(input: UpdateHabitInput): Promise<Habit> {
        return updateHabit(habitRepo, input);
    },
    delete(id: string): Promise<void> {
        return deleteHabit(habitRepo, id);
    },
    toggle(id: string): Promise<Habit> {
        return toggleHabit(habitRepo, id);
    },
    markIncomplete(id: string): Promise<Habit> {
        return markHabitIncomplete(habitRepo, id);
    },
    available(userId: string): Promise<GetAvailableHabitsOutput> {
        return getAvailableHabits(habitRepo, userId);
    },
    archive(id: string): Promise<void> {
        return archiveHabit(habitRepo, id);
    },
    reorder(ids: string[]): Promise<void> {
        return reorderHabits(habitRepo, ids);
    },
    findByTags(tags: string[]): Promise<Habit[]> {
        return findHabitsByTags(habitRepo, tags);
    },
    getTagStats(): Promise<Array<{ tag: string; count: number }>> {
        return getHabitTagStats(habitRepo);
    },
    register(input: { habitId: string; note?: string }): Promise<RegisterHabitOutput> {
        return registerHabit(habitRepo, periodRepo, entryRepo, input);
    },
    registerWithLog(input: { habitId: string; note?: string }): Promise<RegisterHabitWithLogOutput> {
        return registerHabitWithLog(habitRepo, periodRepo, entryRepo, logRepo, input);
    },
    stats(habitId: string): Promise<GetHabitStatsOutput> {
        return getHabitStats(habitRepo, periodRepo, entryRepo, habitId);
    },
    cleanupPeriods(): Promise<void> {
        return cleanupHabitPeriods(periodRepo);
    },
    analytics(timeRange: "week" | "month" | "quarter" | "year"): Promise<GetHabitsAnalyticsOutput> {
        return new GetHabitsAnalyticsUseCase(_habitRepo, _periodRepo, _entryRepo).execute({ timeRange });
    },
};

export type {
    CreateHabitInput,
    Habit,
    HabitDifficulty,
    HabitPriority,
    HabitReset,
    HabitStatus,
    UpdateHabitInput
} from "./types";
