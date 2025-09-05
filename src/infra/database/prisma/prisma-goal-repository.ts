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
	async findByTags(tags: string[]): Promise<Goal[]> {
		const userId = await getCurrentUserId();
		if (!userId) return [];

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
	findByTag(tag: string): Promise<Goal[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const userId = await getCurrentUserId();
		if (!userId) return [];

		const result = await prisma.$queryRaw<Array<{ tag: string; count: bigint }>>`
			SELECT
				UNNEST(tags) as tag,
				COUNT(*) as count
			FROM goals
			WHERE "userId" = ${userId}
			GROUP BY UNNEST(tags)
			ORDER BY count DESC
		`;

		return result.map(row => ({
			tag: row.tag,
			count: Number(row.count)
		}));
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

	// Métodos para tarefas anexadas
	async attachTask(goalId: string, taskId: string, taskType: "habit" | "daily" | "todo"): Promise<void> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		// Verificar se a meta existe e pertence ao usuário
		const goal = await prisma.goal.findUnique({
			where: { id: goalId, userId },
		});
		if (!goal) throw new Error("Goal not found");

		// Verificar se a tarefa existe e pertence ao usuário
		let taskExists = false;
		let taskTitle = "";
		let taskDifficulty = "";

		if (taskType === "habit") {
			const habit = await prisma.habit.findUnique({
				where: { id: taskId, userId },
			});
			if (habit) {
				taskExists = true;
				taskTitle = habit.title;
				taskDifficulty = habit.difficulty;
			}
		} else if (taskType === "daily") {
			const daily = await prisma.daily.findUnique({
				where: { id: taskId, userId },
			});
			if (daily) {
				taskExists = true;
				taskTitle = daily.title;
				taskDifficulty = daily.difficulty;
			}
		} else if (taskType === "todo") {
			const todo = await prisma.todo.findUnique({
				where: { id: taskId, userId },
			});
			if (todo) {
				taskExists = true;
				taskTitle = todo.title;
				taskDifficulty = todo.difficulty;
			}
		}

		if (!taskExists) throw new Error("Task not found");

		// Criar o relacionamento
		await prisma.goalTask.create({
			data: {
				goalId,
				taskId,
				taskType,
			},
		});
	}

	async detachTask(goalId: string, taskId: string, taskType: "habit" | "daily" | "todo"): Promise<void> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		// Verificar se a meta existe e pertence ao usuário
		const goal = await prisma.goal.findUnique({
			where: { id: goalId, userId },
		});
		if (!goal) throw new Error("Goal not found");

		// Remover o relacionamento
		await prisma.goalTask.deleteMany({
			where: {
				goalId,
				taskId,
				taskType,
			},
		});
	}

	async getAttachedTasks(goalId: string): Promise<import("@/domain/entities/goal").GoalAttachedTask[]> {
		const userId = await getCurrentUserId();
		if (!userId) return [];

		// Verificar se a meta existe e pertence ao usuário
		const goal = await prisma.goal.findUnique({
			where: { id: goalId, userId },
		});
		if (!goal) return [];

		const goalTasks = await prisma.goalTask.findMany({
			where: { goalId },
		});

		const attachedTasks: import("@/domain/entities/goal").GoalAttachedTask[] = [];

		for (const goalTask of goalTasks) {
			let taskTitle = "";
			let taskDifficulty = "";

			if (goalTask.taskType === "habit") {
				const habit = await prisma.habit.findUnique({
					where: { id: goalTask.taskId },
				});
				if (habit) {
					taskTitle = habit.title;
					taskDifficulty = habit.difficulty;
				}
			} else if (goalTask.taskType === "daily") {
				const daily = await prisma.daily.findUnique({
					where: { id: goalTask.taskId },
				});
				if (daily) {
					taskTitle = daily.title;
					taskDifficulty = daily.difficulty;
				}
			} else if (goalTask.taskType === "todo") {
				const todo = await prisma.todo.findUnique({
					where: { id: goalTask.taskId },
				});
				if (todo) {
					taskTitle = todo.title;
					taskDifficulty = todo.difficulty;
				}
			}

			if (taskTitle) {
				attachedTasks.push({
					id: goalTask.id,
					taskId: goalTask.taskId,
					taskType: goalTask.taskType as "habit" | "daily" | "todo",
					taskTitle,
					taskDifficulty,
				});
			}
		}

		return attachedTasks;
	}

	async updateAttachedTasks(goalId: string, tasks: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>): Promise<void> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		// Verificar se a meta existe e pertence ao usuário
		const goal = await prisma.goal.findUnique({
			where: { id: goalId, userId },
		});
		if (!goal) throw new Error("Goal not found");

		// Remover todos os relacionamentos existentes
		await prisma.goalTask.deleteMany({
			where: { goalId },
		});

		// Criar novos relacionamentos
		for (const task of tasks) {
			// Verificar se a tarefa existe
			let taskExists = false;

			if (task.taskType === "habit") {
				const habit = await prisma.habit.findUnique({
					where: { id: task.taskId, userId },
				});
				if (habit) taskExists = true;
			} else if (task.taskType === "daily") {
				const daily = await prisma.daily.findUnique({
					where: { id: task.taskId, userId },
				});
				if (daily) taskExists = true;
			} else if (task.taskType === "todo") {
				const todo = await prisma.todo.findUnique({
					where: { id: task.taskId, userId },
				});
				if (todo) taskExists = true;
			}

			if (taskExists) {
				await prisma.goalTask.create({
					data: {
						goalId,
						taskId: task.taskId,
						taskType: task.taskType,
					},
				});
			}
		}
	}

	// Converts Prisma entity to domain entity
	private toDomain(goal: {
		id: string;
		title: string;
		description: string;
		targetDate: Date;
		status: string;
		priority: string;
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
			tags: goal.tags,
			userId: goal.userId,
			createdAt: goal.createdAt,
			updatedAt: goal.updatedAt,
		};
	}
}
