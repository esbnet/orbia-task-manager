import type { HabitLog } from "@/domain/entities/habit-log";
import type { HabitLogRepository } from "@/domain/repositories/all-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaHabitLogRepository implements HabitLogRepository {
	findByEntityId(entityId: string): Promise<HabitLog[]> {
		throw new Error("Method not implemented." + entityId);
	}
	findByDateRange(startDate: Date, endDate: Date): Promise<HabitLog[]> {
		throw new Error("Method not implemented." + startDate + endDate);
	}
	deleteOlderThan(date: Date): Promise<void> {
		throw new Error("Method not implemented." + date);
	}
	findById(id: string): Promise<HabitLog | null> {
		throw new Error("Method not implemented." + id);
	}
	async list(): Promise<HabitLog[]> {
		const logs = await prisma.habitLog.findMany({
			orderBy: { completedAt: "desc" },
		});
		return logs.map(this.toDomain);
	}

	async create(data: Omit<HabitLog, "id" | "createdAt">): Promise<HabitLog> {
		const log = await prisma.habitLog.create({
			data: {
				habitId: data.habitId,
				habitTitle: data.habitTitle,
				difficulty: data.difficulty,
				tags: data.tags,
				completedAt: data.completedAt,
			},
		});
		return this.toDomain(log);
	}

	
	async update(_log: HabitLog): Promise<HabitLog> {
		throw new Error("Update not implemented for habit logs");
	}

	
	async toggleComplete(_id: string): Promise<HabitLog> {
		throw new Error("Toggle complete not implemented for habit logs");
	}

	async delete(id: string): Promise<void> {
		await prisma.habitLog.delete({ where: { id } });
	}

	private toDomain(log: {
		id: string;
		habitId: string;
		habitTitle: string;
		difficulty: string;
		tags: string[];
		completedAt: Date;
	}): HabitLog {
		return {
			id: log.id,
			habitId: log.habitId,
			habitTitle: log.habitTitle,
			difficulty: log.difficulty,
			tags: log.tags,
			completedAt: log.completedAt,
			createdAt: log.completedAt, // Usando completedAt como createdAt já que o schema não tem createdAt
		};
	}
}
