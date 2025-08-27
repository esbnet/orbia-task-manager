import { prisma } from "@/infra/database/prisma/prisma-client";

export interface DailyPeriod {
	id: string;
	dailyId: string;
	periodType: string;
	startDate: Date;
	endDate: Date | null;
	isCompleted: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateDailyPeriodData {
	dailyId: string;
	periodType: string;
	startDate: Date;
	endDate?: Date | null;
	isCompleted?: boolean;
	isActive?: boolean;
}

export interface UpdateDailyPeriodData {
	isCompleted?: boolean;
	endDate?: Date | null;
	isActive?: boolean;
}

export interface DailyPeriodRepository {
	findActiveByDailyId(dailyId: string): Promise<DailyPeriod | null>;
	create(data: CreateDailyPeriodData): Promise<DailyPeriod>;
	update(id: string, data: UpdateDailyPeriodData): Promise<DailyPeriod>;
	findById(id: string): Promise<DailyPeriod | null>;
	findByDailyId(dailyId: string): Promise<DailyPeriod[]>;
	completeAndFinalize(id: string): Promise<DailyPeriod>;
}

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
