import type { CreateHabitEntryData, HabitEntry, HabitEntryWithPeriod } from "@/domain/entities/habit-entry";

import type { HabitEntryRepository } from "@/domain/repositories/habit-entry-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaHabitEntryRepository implements HabitEntryRepository {
	async create(data: CreateHabitEntryData): Promise<HabitEntry> {
		const entry = await prisma.habitEntry.create({
			data: {
				habitId: data.habitId,
				periodId: data.periodId,
				note: data.note,
			},
		});

		return this.toDomain(entry);
	}

	async findByPeriodId(periodId: string): Promise<HabitEntry[]> {
		const entries = await prisma.habitEntry.findMany({
			where: { periodId },
			orderBy: {
				timestamp: 'desc',
			},
		});

		return entries.map(this.toDomain);
	}

	async findByHabitId(habitId: string): Promise<HabitEntry[]> {
		const entries = await prisma.habitEntry.findMany({
			where: { habitId },
			orderBy: {
				timestamp: 'desc',
			},
		});

		return entries.map(this.toDomain);
	}

	async findByHabitIdWithPeriod(habitId: string): Promise<HabitEntryWithPeriod[]> {
		const entries = await prisma.habitEntry.findMany({
			where: { habitId },
			include: {
				period: {
					select: {
						id: true,
						periodType: true,
						startDate: true,
						endDate: true,
						count: true,
						target: true,
					},
				},
			},
			orderBy: {
				timestamp: 'desc',
			},
		});

		return entries.map(entry => ({
			...this.toDomain(entry),
			period: {
				id: entry.period.id,
				periodType: entry.period.periodType,
				startDate: entry.period.startDate,
				endDate: entry.period.endDate || undefined,
				count: entry.period.count,
				target: entry.period.target || undefined,
			},
		}));
	}

	async findByHabitIdAndPeriod(habitId: string, periodId: string): Promise<HabitEntry[]> {
		const entries = await prisma.habitEntry.findMany({
			where: {
				habitId,
				periodId,
			},
			orderBy: {
				timestamp: 'desc',
			},
		});

		return entries.map(this.toDomain);
	}

	async findTodayByHabitId(habitId: string): Promise<HabitEntry[]> {
		const today = new Date();
		const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

		const entries = await prisma.habitEntry.findMany({
			where: {
				habitId,
				timestamp: {
					gte: startOfDay,
					lt: endOfDay,
				},
			},
			orderBy: {
				timestamp: 'desc',
			},
		});

		return entries.map(this.toDomain);
	}

	async countByPeriodId(periodId: string): Promise<number> {
		return await prisma.habitEntry.count({
			where: { periodId },
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.habitEntry.delete({
			where: { id },
		});
	}

	private toDomain(entry: {
		id: string;
		habitId: string;
		periodId: string;
		timestamp: Date;
		note: string | null;
		createdAt: Date;
	}): HabitEntry {
		return {
			id: entry.id,
			habitId: entry.habitId,
			periodId: entry.periodId,
			timestamp: entry.timestamp,
			note: entry.note || undefined,
			createdAt: entry.createdAt,
		};
	}
}
