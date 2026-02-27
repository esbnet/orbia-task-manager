import type { Habit } from "@/domain/entities/habit";
import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { CreateEntityData } from "@/domain/repositories/base-repository";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaHabitRepository implements HabitRepository {
	async list(): Promise<Habit[]> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return [];
		}

		const habits = await prisma.habit.findMany({
			where: { userId, status: { not: "archived" } },
			orderBy: { order: "asc" },
			select: {
				id: true,
				title: true,
				observations: true,
				difficulty: true,
				status: true,
				priority: true,
				tags: true,
				reset: true,
				order: true,
				lastCompletedDate: true,
				userId: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return habits.map(this.toDomain);
	}

	async create(data: CreateEntityData<Habit>): Promise<Habit> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		// Verificar se o usuário existe, se não, criar
		await prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId },
		});

		const habit = await prisma.habit.create({
			data: {
				title: data.title,
				observations: data.observations,
				difficulty: data.difficulty,
				status: data.status || "active",
				priority: data.priority || "Média",
				tags: data.tags,
				reset: data.reset,
				order: data.order ?? 0,
				userId,
			},
		});
		return this.toDomain(habit);
	}

	async update(habit: Habit): Promise<Habit> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const updated = await prisma.habit.update({
			where: { id: habit.id, userId },
			data: {
				title: habit.title,
				observations: habit.observations,
				difficulty: habit.difficulty,
				status: habit.status,
				priority: habit.priority,
				tags: habit.tags,
				reset: habit.reset,
				order: habit.order,
				lastCompletedDate: habit.lastCompletedDate,
			},
		});
		return this.toDomain(updated);
	}

	async toggleComplete(id: string): Promise<Habit> {
		// Alias maintained for compatibility with existing use cases/services.
		return this.markComplete(id);
	}

	async delete(id: string): Promise<void> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		await prisma.habit.delete({ where: { id, userId } });
	}

	// UserOwnedRepository methods
	async findByUserId(userId: string): Promise<Habit[]> {
		const habits = await prisma.habit.findMany({
			where: { userId, status: { not: "archived" } },
			orderBy: { order: "asc" },
			select: {
				id: true,
				title: true,
				observations: true,
				difficulty: true,
				status: true,
				priority: true,
				tags: true,
				reset: true,
				order: true,
				lastCompletedDate: true,
				userId: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return habits.map(this.toDomain);
	}

	async deleteByUserId(userId: string): Promise<void> {
		await prisma.habit.deleteMany({ where: { userId } });
	}

	// BaseRepository methods
	async findById(id: string): Promise<Habit | null> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) return null;

		const habit = await prisma.habit.findUnique({
			where: { id, userId }
		});
		return habit ? this.toDomain(habit) : null;
	}

	// CompletableRepository methods
	async markComplete(id: string): Promise<Habit> {
		// Canonical completion method in the repository layer.
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const habit = await prisma.habit.findUnique({ where: { id, userId } });
		if (!habit) throw new Error("Habit not found");

		const updated = await prisma.habit.update({
			where: { id, userId },
			data: { lastCompletedDate: new Date().toISOString().split("T")[0] },
		});
		return this.toDomain(updated);
	}

	async markIncomplete(id: string): Promise<Habit> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const updated = await prisma.habit.update({
			where: { id, userId },
			data: { lastCompletedDate: null },
		});
		return this.toDomain(updated);
	}

	// OrderableRepository methods
	async reorder(ids: string[]): Promise<void> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		// Update order for each habit
		await Promise.all(
			ids.map((id, index) =>
				prisma.habit.update({
					where: { id, userId },
					data: { order: index },
				})
			)
		);
	}

	async moveToPosition(id: string, position: number): Promise<Habit> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) throw new Error("User not authenticated");

		const updated = await prisma.habit.update({
			where: { id, userId },
			data: { order: position },
		});
		return this.toDomain(updated);
	}

	// TaggableRepository methods
	async findByTags(tags: string[]): Promise<Habit[]> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) return [];

		const habits = await prisma.habit.findMany({
			where: {
				userId,
				tags: {
					hasSome: tags,
				},
			},
			orderBy: { order: "asc" },
			select: {
				id: true,
				title: true,
				observations: true,
				difficulty: true,
				status: true,
				priority: true,
				tags: true,
				reset: true,
				order: true,
				lastCompletedDate: true,
				userId: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return habits.map(this.toDomain);
	}

	async findByTag(tag: string): Promise<Habit[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) return [];

		const result = await prisma.$queryRaw<Array<{ tag: string; count: bigint }>>`
			SELECT
				UNNEST(tags) as tag,
				COUNT(*) as count
			FROM habits
			WHERE "userId" = ${userId}
			GROUP BY UNNEST(tags)
			ORDER BY count DESC
		`;

		return result.map(row => ({
			tag: row.tag,
			count: Number(row.count)
		}));
	}

	private toDomain(habit: {
		id: string;
		title: string;
		observations: string;
		difficulty: string;
		status: string;
		priority: string;
		tags: string[];
		reset: string;
		order: number;
		lastCompletedDate: string | null;
		userId: string;
		createdAt: Date;
		updatedAt: Date;
	}): Habit {
		return {
			id: habit.id,
			title: habit.title,
			observations: habit.observations,
			difficulty: habit.difficulty as Habit["difficulty"],
			status: habit.status as Habit["status"],
			priority: habit.priority as Habit["priority"],
			tags: habit.tags,
			reset: habit.reset as Habit["reset"],
			order: habit.order,
			lastCompletedDate: habit.lastCompletedDate || undefined,
			userId: habit.userId,
			createdAt: habit.createdAt,
			updatedAt: habit.updatedAt,
			currentPeriod: null, // Campo computado, será calculado posteriormente se necessário
			todayEntries: 0, // Inicialmente 0, será atualizado conforme necessário
		};
	}
}
