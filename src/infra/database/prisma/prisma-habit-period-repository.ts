import type { CreateHabitPeriodData, HabitPeriod, UpdateHabitPeriodData } from "@/domain/entities/habit-period";

import type { HabitPeriodRepository } from "@/domain/repositories/habit-period-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaHabitPeriodRepository implements HabitPeriodRepository {
	async findActiveByHabitId(habitId: string): Promise<HabitPeriod | null> {
		const period = await prisma.habitPeriod.findFirst({
			where: {
				habitId,
				isActive: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return period ? this.toDomain(period) : null;
	}

	async findByHabitId(habitId: string): Promise<HabitPeriod[]> {
		const periods = await prisma.habitPeriod.findMany({
			where: { habitId },
			orderBy: {
				createdAt: 'desc',
			},
		});

		return periods.map(this.toDomain);
	}

	async findById(id: string): Promise<HabitPeriod | null> {
		const period = await prisma.habitPeriod.findUnique({
			where: { id },
		});

		return period ? this.toDomain(period) : null;
	}

	async create(data: CreateHabitPeriodData): Promise<HabitPeriod> {
		const period = await prisma.habitPeriod.create({
			data: {
				habitId: data.habitId,
				periodType: data.periodType,
				startDate: data.startDate,
				target: data.target,
			},
		});

		return this.toDomain(period);
	}

	async update(id: string, data: UpdateHabitPeriodData): Promise<HabitPeriod> {
		const period = await prisma.habitPeriod.update({
			where: { id },
			data,
		});

		return this.toDomain(period);
	}

	async finalizePeriod(id: string): Promise<HabitPeriod> {
		const period = await prisma.habitPeriod.update({
			where: { id },
			data: {
				isActive: false,
				endDate: new Date(),
			},
		});

		return this.toDomain(period);
	}

	async incrementCount(id: string): Promise<HabitPeriod> {
		const period = await prisma.habitPeriod.update({
			where: { id },
			data: {
				count: {
					increment: 1,
				},
			},
		});

		return this.toDomain(period);
	}

	async findPeriodsToFinalize(): Promise<HabitPeriod[]> {
		const now = new Date();
		const periods = await prisma.habitPeriod.findMany({
			where: {
				isActive: true,
				OR: [
					// Períodos diários que passaram de 1 dia
					{
						periodType: "Diariamente",
						startDate: {
							lt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
						},
					},
					// Períodos semanais que passaram de 7 dias
					{
						periodType: "Semanalmente",
						startDate: {
							lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
						},
					},
					// Períodos mensais que passaram de 30 dias
					{
						periodType: "Mensalmente",
						startDate: {
							lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
						},
					},
				],
			},
		});

		return periods.map(this.toDomain);
	}

	private toDomain(period: {
		id: string;
		habitId: string;
		periodType: string;
		startDate: Date;
		endDate: Date | null;
		count: number;
		target: number | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): HabitPeriod {
		return {
			id: period.id,
			habitId: period.habitId,
			periodType: period.periodType as HabitPeriod["periodType"],
			startDate: period.startDate,
			endDate: period.endDate || undefined,
			count: period.count,
			target: period.target || undefined,
			isActive: period.isActive,
			createdAt: period.createdAt,
			updatedAt: period.updatedAt,
		};
	}
}
