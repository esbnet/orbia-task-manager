import { prisma } from "@/infra/database/prisma/prisma-client";
import type { DailyPeriod, CreateDailyPeriodData, UpdateDailyPeriodData } from "@/domain/entities/daily-period";
import type { DailyPeriodRepository } from "@/domain/repositories/all-repository";

export class PrismaDailyPeriodRepository implements DailyPeriodRepository {
	async findActiveByDailyId(dailyId: string): Promise<DailyPeriod | null> {
		return await prisma.dailyPeriod.findFirst({
			where: {
				dailyId,
				isActive: true,
			},
		});
	}

	async create(data: CreateDailyPeriodData): Promise<DailyPeriod> {
		return await prisma.dailyPeriod.create({
			data: {
				dailyId: data.dailyId,
				periodType: data.periodType,
				startDate: data.startDate,
				endDate: data.endDate || null,
				isCompleted: data.isCompleted ?? false,
				isActive: data.isActive ?? true,
			},
		});
	}

	async update(id: string, data: UpdateDailyPeriodData): Promise<DailyPeriod> {
		return await prisma.dailyPeriod.update({
			where: { id },
			data,
		});
	}

	async findById(id: string): Promise<DailyPeriod | null> {
		return await prisma.dailyPeriod.findUnique({
			where: { id },
		});
	}

	async findByDailyId(dailyId: string): Promise<DailyPeriod[]> {
		return await prisma.dailyPeriod.findMany({
			where: { dailyId },
			orderBy: { createdAt: 'desc' },
		});
	}

	async completeAndFinalize(id: string): Promise<DailyPeriod> {
		return await prisma.dailyPeriod.update({
			where: { id },
			data: {
				isCompleted: true,
				isActive: false,
				endDate: new Date(),
			},
		});
	}
}
