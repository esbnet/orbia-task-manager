import type { Daily } from "@/domain/entities/daily";
import type { DailyRepository } from "@/domain/repositories/all-repository";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";
import { PrismaDailyPeriodRepository } from './prisma-daily-period-repository';

export class PrismaDailyRepository implements DailyRepository {
	private dailyPeriodRepository = new PrismaDailyPeriodRepository();

	async findByUserId(userId: string): Promise<Daily[]> {
		const dailies = await prisma.daily.findMany({
			where: { userId, status: { not: "archived" } },
			orderBy: { order: "asc" },
			select: {
				id: true,
				userId: true,
				title: true,
				observations: true,
				tasks: true,
				difficulty: true,
				startDate: true,
				repeatType: true,
				repeatFrequency: true,
				tags: true,
				order: true,
				lastCompletedDate: true,
				status: true,
				createdAt: true,
				subtasks: {
					orderBy: { order: "asc" },
				},
			},
		});
		return dailies.map(this.toDomain);
	}

	async deleteByUserId(userId: string): Promise<void> {
		await prisma.daily.deleteMany({ where: { userId } });
	}

	async markComplete(id: string): Promise<Daily> {
		// LEGACY PATH: the main HTTP flow now completes dailies via DailyApplicationService
		// Legacy callers now receive a minimal "mark complete" behavior (lastCompletedDate update only).
		// Full completion orchestration (periods/logs/next period) lives in DailyApplicationService.
		return this.toggleComplete(id);
	}

	async markIncomplete(id: string): Promise<Daily> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const daily = await this.findById(id);
		if (!daily) throw new Error("Daily not found");

		// Find latest completed period and mark incomplete if possible
		const latestPeriod = await this.dailyPeriodRepository.findByDailyId(id).then(periods => periods[0]);
		if (latestPeriod && latestPeriod.isCompleted) {
			await this.dailyPeriodRepository.update(latestPeriod.id, {
				isCompleted: false,
				isActive: true,
			});
		}

		const updatedDaily = await prisma.daily.update({
			where: { id, userId },
			data: {
				lastCompletedDate: null,
			},
		});
		return this.toDomain(updatedDaily);
	}

	async reorder(ids: string[]): Promise<void> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		await Promise.all(
			ids.map((id, index) =>
				prisma.daily.update({
					where: { id, userId },
					data: { order: index },
				})
			)
		);
	}

	async moveToPosition(id: string, position: number): Promise<Daily> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const updated = await prisma.daily.update({
			where: { id, userId },
			data: { order: position },
		});

		return this.toDomain(updated);
	}

	private calculatePeriodEnd(type: string, startDate: Date, frequency: number): Date {
		const endDate = new Date(startDate);
		switch (type) {
			case "Diariamente":
				endDate.setHours(23, 59, 59, 999);
				break;
			case "Semanalmente":
				endDate.setDate(endDate.getDate() + (7 * frequency - 1));
				endDate.setHours(23, 59, 59, 999);
				break;
			case "Mensalmente":
				endDate.setMonth(endDate.getMonth() + frequency);
				endDate.setDate(0); // Last day of the month
				endDate.setHours(23, 59, 59, 999);
				break;
			case "Anualmente":
				endDate.setFullYear(endDate.getFullYear() + frequency);
				endDate.setDate(0); // Dec 31st
				endDate.setMonth(11);
				endDate.setHours(23, 59, 59, 999);
				endDate.setFullYear(endDate.getFullYear() - 1);
				break;
			default:
				endDate.setHours(23, 59, 59, 999);
		}
		return endDate;
	}
	async findByTags(tags: string[]): Promise<Daily[]> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) return [];

		const daily = await prisma.daily.findMany({
			where: {
				userId,
				status: { not: "archived" },
				tags: {
					hasSome: tags,
				},
			},
			orderBy: { order: "asc" },
			select: {
				id: true,
				userId: true,
				title: true,
				observations: true,
				tasks: true,
				difficulty: true,
				startDate: true,
				repeatType: true,
				repeatFrequency: true,
				tags: true,
				order: true,
				lastCompletedDate: true,
				status: true,
				createdAt: true,
				subtasks: {
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						completed: true,
						dailyId: true,
						order: true,
						createdAt: true,
					},
				},
			},
		});
		return daily.map(this.toDomain);
	}
	findByTag(tag: string): Promise<Daily[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) return [];

		const result = await prisma.$queryRaw<Array<{ tag: string; count: bigint }>>`
			SELECT
				UNNEST(tags) as tag,
				COUNT(*) as count
			FROM dailies
			WHERE "userId" = ${userId}
			GROUP BY UNNEST(tags)
			ORDER BY count DESC
		`;

		return result.map(row => ({
			tag: row.tag,
			count: Number(row.count)
		}));
	}
	async list(): Promise<Daily[]> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return [];
		}

		const daily = await prisma.daily.findMany({
			where: { userId, status: { not: "archived" } },
			orderBy: { order: "asc" },
			select: {
				id: true,
				userId: true,
				title: true,
				observations: true,
				tasks: true,
				difficulty: true,
				startDate: true,
				repeatType: true,
				repeatFrequency: true,
				tags: true,
				order: true,
				lastCompletedDate: true,
				status: true,
				createdAt: true,
				subtasks: {
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						completed: true,
						dailyId: true,
						order: true,
						createdAt: true,
					},
				},
			},
		});
		return daily.map(this.toDomain);
	}

	async findAll(): Promise<Daily[]> {
		return this.list();
	}

	async findById(id: string): Promise<Daily | null> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return null;
		}

		const daily = await prisma.daily.findUnique({
			where: { id, userId },
			select: {
				id: true,
				userId: true,
				title: true,
				observations: true,
				tasks: true,
				difficulty: true,
				startDate: true,
				repeatType: true,
				repeatFrequency: true,
				tags: true,
				order: true,
				lastCompletedDate: true,
				status: true,
				createdAt: true,
				subtasks: {
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						completed: true,
						dailyId: true,
						order: true,
						createdAt: true,
					},
				},
			},
		});

		return daily ? this.toDomain(daily) : null;
	}

	async create(data: Omit<Daily, "id" | "createdAt">): Promise<Daily> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		await prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId },
		});

		const daily = await prisma.daily.create({
			data: {
				title: data.title,
				observations: data.observations,
				tasks: data.tasks,
				difficulty: data.difficulty,
				startDate: data.startDate,
				repeatType: data.repeat.type,
				repeatFrequency: data.repeat.frequency,
				tags: data.tags,
				order: data.order ?? 0,
				status: data.status ?? "active",
				userId,
			},
		});

		const now = new Date();
		const endDate = this.calculatePeriodEnd(data.repeat.type, now, data.repeat.frequency);
		await this.dailyPeriodRepository.create({
			dailyId: daily.id,
			periodType: data.repeat.type,
			startDate: now,
			endDate,
			isCompleted: false,
			isActive: true,
		});

		return this.toDomain(daily);
	}

	async update(daily: Daily): Promise<Daily> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const updated = await prisma.daily.update({
			where: { id: daily.id, userId },
			data: {
				title: daily.title,
				observations: daily.observations,
				tasks: daily.tasks,
				difficulty: daily.difficulty,
				startDate: daily.startDate,
				repeatType: daily.repeat.type,
				repeatFrequency: daily.repeat.frequency,
				tags: daily.tags,
				order: daily.order,
				lastCompletedDate: daily.lastCompletedDate,
				status: daily.status ?? "active",
			},
		});
		return this.toDomain(updated);
	}

	async toggleComplete(id: string): Promise<Daily> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const daily = await prisma.daily.findUnique({ where: { id, userId } });
		if (!daily) throw new Error("Daily not found");

		const updated = await prisma.daily.update({
			where: { id, userId },
			data: { lastCompletedDate: new Date().toISOString().split("T")[0] },
		});
		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		await prisma.daily.delete({ where: { id, userId } });
	}

	private toDomain(daily: {
		id: string;
		userId: string;
		title: string;
		observations: string;
		tasks: string[];
		difficulty: string;
		startDate: Date;
		repeatType: string;
		repeatFrequency: number;
		tags: string[];
		order: number;
		lastCompletedDate: string | null;
		status?: string | null;
		createdAt: Date;
		subtasks?: Array<{
			id: string;
			title: string;
			completed: boolean;
			dailyId: string;
			order: number;
			createdAt: Date;
		}>;
	}): Daily {
		return {
			id: daily.id,
			userId: daily.userId,
			title: daily.title,
			observations: daily.observations,
			tasks: daily.tasks,
			difficulty: daily.difficulty as Daily["difficulty"],
			startDate: daily.startDate,
			repeat: {
				type: daily.repeatType as Daily["repeat"]["type"],
				frequency: daily.repeatFrequency,
			},
			tags: daily.tags,
			order: daily.order,
			lastCompletedDate: daily.lastCompletedDate || undefined,
			status: (daily.status as Daily["status"]) || "active",
			createdAt: daily.createdAt,
			subtasks:
				daily.subtasks?.map((s) => ({
					id: s.id,
					title: s.title,
					completed: s.completed,
					dailyId: s.dailyId,
					order: s.order,
					createdAt: s.createdAt,
				})) || [],
		};
	}
}
