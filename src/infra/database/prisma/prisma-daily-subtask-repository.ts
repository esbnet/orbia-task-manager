import type { DailySubtask } from "@/domain/entities/daily-subtask";
import type { DailySubtaskRepository } from "@/domain/repositories/all-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaDailySubtaskRepository implements DailySubtaskRepository {
	async list(): Promise<DailySubtask[]> {
		const subtasks = await prisma.dailySubtask.findMany({
			orderBy: { order: "asc" },
		});
		return subtasks.map(this.toDomain);
	}

	async listByDailyId(dailyId: string): Promise<DailySubtask[]> {
		const subtasks = await prisma.dailySubtask.findMany({
			where: { dailyId },
			orderBy: { order: "asc" },
		});
		return subtasks.map(this.toDomain);
	}

	async create(
		data: Omit<DailySubtask, "id" | "createdAt">,
	): Promise<DailySubtask> {
		const subtask = await prisma.dailySubtask.create({
			data: {
				title: data.title,
				completed: data.completed,
				dailyId: data.dailyId,
				order: data.order,
			},
		});
		return this.toDomain(subtask);
	}

	async update(subtask: DailySubtask): Promise<DailySubtask> {
		const updated = await prisma.dailySubtask.update({
			where: { id: subtask.id },
			data: {
				title: subtask.title,
				completed: subtask.completed,
				order: subtask.order,
			},
		});
		return this.toDomain(updated);
	}

	async toggleComplete(id: string): Promise<DailySubtask> {
		const subtask = await prisma.dailySubtask.findUnique({ where: { id } });
		if (!subtask) throw new Error("Subtask not found");

		const updated = await prisma.dailySubtask.update({
			where: { id },
			data: { completed: !subtask.completed },
		});
		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		await prisma.dailySubtask.delete({ where: { id } });
	}

	async findByParentId(parentId: string): Promise<DailySubtask[]> {
		const subtasks = await prisma.dailySubtask.findMany({
			where: { dailyId: parentId },
			orderBy: { order: "asc" },
		});
		return subtasks.map(this.toDomain);
	}

	async deleteByParentId(parentId: string): Promise<void> {
		await prisma.dailySubtask.deleteMany({ where: { dailyId: parentId } });
	}

	async reorderByParentId(parentId: string, ids: string[]): Promise<void> {
		await Promise.all(
			ids.map((id, index) =>
				prisma.dailySubtask.update({
					where: { id },
					data: { order: index },
				})
			)
		);
	}

	async findById(id: string): Promise<DailySubtask | null> {
		const subtask = await prisma.dailySubtask.findUnique({ where: { id } });
		return subtask ? this.toDomain(subtask) : null;
	}

	private toDomain(subtask: {
		id: string;
		title: string;
		completed: boolean;
		dailyId: string;
		order: number;
		createdAt: Date;
	}): DailySubtask {
		return {
			id: subtask.id,
			title: subtask.title,
			completed: subtask.completed,
			dailyId: subtask.dailyId,
			order: subtask.order,
			createdAt: subtask.createdAt,
		};
	}
}
