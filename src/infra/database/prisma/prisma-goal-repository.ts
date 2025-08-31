import type { Goal, GoalCategory, GoalPriority, GoalStatus } from "@/domain/entities/goal";

import type { GoalRepository } from "@/domain/repositories/goal-repository";
import { getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaGoalRepository implements GoalRepository {
	deleteByUserId(userId: string): Promise<void> {
		throw new Error("Method not implemented." + userId);
	}
	findByStatus(status: GoalStatus): Promise<Goal[]> {
		throw new Error("Method not implemented." + status);
	}
	updateStatus(id: string, status: GoalStatus): Promise<Goal> {
		throw new Error("Method not implemented." + status + id);
	}
	findByPriority(priority: GoalPriority): Promise<Goal[]> {
		throw new Error("Method not implemented." + priority);
	}
	updatePriority(id: string, priority: GoalPriority): Promise<Goal> {
		throw new Error("Method not implemented." + priority + id);
	}
	findByCategory(category: GoalCategory): Promise<Goal[]> {
		throw new Error("Method not implemented." + category);
	}
	updateCategory(id: string, category: GoalCategory): Promise<Goal> {
		throw new Error("Method not implemented." + category + id);
	}
	findByTags(tags: string[]): Promise<Goal[]> {
		throw new Error("Method not implemented." + tags);
	}
	findByTag(tag: string): Promise<Goal[]> {
		throw new Error("Method not implemented." + tag);
	}
	findOverdueByUserId(userId: string): Promise<Goal[]> {
		throw new Error("Method not implemented." + userId);
	}
	findDueSoonByUserId(userId: string, days: number): Promise<Goal[]> {
		throw new Error("Method not implemented." + userId + days);
	}
	findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
		throw new Error("Method not implemented." + startDate + endDate);
	}
	findOverdue(): Promise<Goal[]> {
		throw new Error("Method not implemented.");
	}
	findDueSoon(days: number): Promise<Goal[]> {
		throw new Error("Method not implemented." + days);
	}
	async list(): Promise<Goal[]> {
		const userId = await getCurrentUserId();
		if (!userId) {
			return [];
		}

		const goals = await prisma.goal.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});

		return goals.map(this.toDomain);
	}

	async create(
		data: Omit<Goal, "id" | "createdAt" | "updatedAt">,
	): Promise<Goal> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		// Verificar se o usuário existe, se não, criar
		await prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId },
		});

		const goal = await prisma.goal.create({
			data: {
				title: data.title,
				description: data.description,
				targetDate: data.targetDate,
				status: data.status,
				priority: data.priority,
				category: data.category,
				tags: data.tags,
				userId,
			},
		});

		return this.toDomain(goal);
	}

	async update(goal: Goal): Promise<Goal> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		const updated = await prisma.goal.update({
			where: { id: goal.id, userId },
			data: {
				title: goal.title,
				description: goal.description,
				targetDate: goal.targetDate,
				status: goal.status,
				priority: goal.priority,
				category: goal.category,
				tags: goal.tags,
			},
		});

		return this.toDomain(updated);
	}

	async toggleComplete(id: string): Promise<Goal> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		const goal = await prisma.goal.findUnique({ where: { id, userId } });
		if (!goal) throw new Error("Goal not found");

		const updated = await prisma.goal.update({
			where: { id, userId },
			data: {
				status:
					goal.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
				updatedAt: new Date(),
			},
		});

		return this.toDomain(updated);
	}

	async findById(id: string): Promise<Goal | null> {
		const userId = await getCurrentUserId();
		if (!userId) return null;

		const goal = await prisma.goal.findUnique({
			where: { id, userId },
		});

		return goal ? this.toDomain(goal) : null;
	}

	async delete(id: string): Promise<void> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		await prisma.goal.delete({ where: { id, userId } });
	}

	// Métodos específicos do GoalRepository
	async findByUserId(userId: string): Promise<Goal[]> {
		const goals = await prisma.goal.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});

		return goals.map(this.toDomain);
	}

	async findByUserIdAndStatus(
		userId: string,
		status: Goal["status"] ,
	): Promise<Goal[]> {
		const goals = await prisma.goal.findMany({
			where: { userId, status },
			orderBy: { createdAt: "desc" },
		});

		return goals.map(this.toDomain);
	}

	async findByUserIdAndPriority(
		userId: string,
		priority: Goal["priority"],
	): Promise<Goal[]> {
		const goals = await prisma.goal.findMany({
			where: { userId, priority },
			orderBy: { createdAt: "desc" },
		});

		return goals.map(this.toDomain);
	}

	async findByUserIdAndCategory(
		userId: string,
		category: Goal["category"],
	): Promise<Goal[]> {
		const goals = await prisma.goal.findMany({
			where: { userId, category },
			orderBy: { createdAt: "desc" },
		});

		return goals.map(this.toDomain);
	}

	async findByUserIdAndTags(userId: string, tags: string[]): Promise<Goal[]> {
		const goals = await prisma.goal.findMany({
			where: {
				userId,
				tags: {
					hasSome: tags,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return goals.map(this.toDomain);
	}

	async findUserIdAndOverdue(userId: string): Promise<Goal[]> {
		const goals = await prisma.goal.findMany({
			where: {
				userId,
				status: "IN_PROGRESS",
				targetDate: {
					lt: new Date(),
				},
			},
			orderBy: { targetDate: "asc" },
		});

		return goals.map(this.toDomain);
	}

	async findUserIdAndDueSoon(userId: string, days: number): Promise<Goal[]> {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + days);

		const goals = await prisma.goal.findMany({
			where: {
				userId,
				status: "IN_PROGRESS",
				targetDate: {
					gte: new Date(),
					lte: futureDate,
				},
			},
			orderBy: { targetDate: "asc" },
		});

		return goals.map(this.toDomain);
	}

	// Converts Prisma entity to domain entity
	private toDomain(goal: {
		id: string;
		title: string;
		description: string;
		targetDate: Date;
		status: string;
		priority: string;
		category: string;
		tags: string[];
		userId: string;
		createdAt: Date;
		updatedAt: Date;
	}): Goal {
		return {
			id: goal.id,
			title: goal.title,
			description: goal.description,
			targetDate: goal.targetDate,
			status: goal.status as Goal["status"],
			priority: goal.priority as Goal["priority"],
			category: goal.category as Goal["category"],
			tags: goal.tags,
			userId: goal.userId,
			createdAt: goal.createdAt,
			updatedAt: goal.updatedAt,
		};
	}
}
