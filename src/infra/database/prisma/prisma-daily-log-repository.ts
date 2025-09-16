import type { DailyLog } from "@/domain/entities/daily-log";
import type { DailyLogRepository } from "@/domain/repositories/all-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaDailyLogRepository implements DailyLogRepository {
	async list(): Promise<DailyLog[]> {
		const logs = await prisma.dailyLog.findMany({
			orderBy: { completedAt: "desc" },
		});
		return logs.map(this.toDomain);
	}

	async create(data: Omit<DailyLog, "id" | "createdAt">): Promise<DailyLog> {
		const log = await prisma.dailyLog.create({
			data: {
				dailyId: data.dailyId,
				periodId: data.periodId,
				dailyTitle: data.dailyTitle,
				difficulty: data.difficulty,
				tags: data.tags,
				completedAt: data.completedAt,
			},
		});
		return this.toDomain(log);
	}

	
	async update(_log: DailyLog): Promise<DailyLog> {
		throw new Error("Update not implemented for daily logs");
	}

	
	async toggleComplete(_id: string): Promise<DailyLog> {
		throw new Error("Toggle complete not implemented for daily logs");
	}

	async delete(id: string): Promise<void> {
		await prisma.dailyLog.delete({ where: { id } });
	}

	async findByEntityId(entityId: string): Promise<DailyLog[]> {
		const logs = await prisma.dailyLog.findMany({
			where: { dailyId: entityId },
			orderBy: { completedAt: "desc" },
		});
		return logs.map(this.toDomain);
	}

	async findByDateRange(startDate: Date, endDate: Date): Promise<DailyLog[]> {
		const logs = await prisma.dailyLog.findMany({
			where: {
				completedAt: {
					gte: startDate,
					lte: endDate,
				},
			},
			orderBy: { completedAt: "desc" },
		});
		return logs.map(this.toDomain);
	}

	async deleteOlderThan(date: Date): Promise<void> {
		await prisma.dailyLog.deleteMany({
			where: {
				completedAt: {
					lt: date,
				},
			},
		});
	}

	async findById(id: string): Promise<DailyLog | null> {
		const log = await prisma.dailyLog.findUnique({ where: { id } });
		return log ? this.toDomain(log) : null;
	}

	private toDomain(log: {
		id: string;
		dailyId: string;
		periodId?: string | null;
		dailyTitle: string;
		difficulty: string;
		tags: string[];
		completedAt: Date;
		createdAt: Date;
	}): DailyLog {
		return {
			id: log.id,
			dailyId: log.dailyId,
			periodId: log.periodId || undefined,
			dailyTitle: log.dailyTitle,
			difficulty: log.difficulty,
			tags: log.tags,
			completedAt: log.completedAt,
			createdAt: log.createdAt,
		};
	}
}
