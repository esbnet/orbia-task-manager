import type { TodoSubtask } from "@/domain/entities/todo-subtask";
import type { TodoSubtaskRepository } from "@/domain/repositories/all-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaTodoSubtaskRepository implements TodoSubtaskRepository {
	async list(): Promise<TodoSubtask[]> {
		const subtasks = await prisma.todoSubtask.findMany({
			orderBy: { order: "asc" },
		});
		return subtasks.map(this.toDomain);
	}

	async listByTodoId(todoId: string): Promise<TodoSubtask[]> {
		const subtasks = await prisma.todoSubtask.findMany({
			where: { todoId },
			orderBy: { order: "asc" },
		});
		return subtasks.map(this.toDomain);
	}

	async create(
		data: Omit<TodoSubtask, "id" | "createdAt">,
	): Promise<TodoSubtask> {
		const subtask = await prisma.todoSubtask.create({
			data: {
				title: data.title,
				completed: data.completed,
				todoId: data.todoId,
				order: data.order,
			},
		});
		return this.toDomain(subtask);
	}

	async update(subtask: TodoSubtask): Promise<TodoSubtask> {
		const updated = await prisma.todoSubtask.update({
			where: { id: subtask.id },
			data: {
				title: subtask.title,
				completed: subtask.completed,
				order: subtask.order,
			},
		});
		return this.toDomain(updated);
	}

	async toggleComplete(id: string): Promise<TodoSubtask> {
		const subtask = await prisma.todoSubtask.findUnique({ where: { id } });
		if (!subtask) throw new Error("Subtask not found");

		const updated = await prisma.todoSubtask.update({
			where: { id },
			data: { completed: !subtask.completed },
		});
		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		await prisma.todoSubtask.delete({ where: { id } });
	}

	async findByParentId(parentId: string): Promise<TodoSubtask[]> {
		const subtasks = await prisma.todoSubtask.findMany({
			where: { todoId: parentId },
			orderBy: { order: "asc" },
		});
		return subtasks.map(this.toDomain);
	}

	async deleteByParentId(parentId: string): Promise<void> {
		await prisma.todoSubtask.deleteMany({ where: { todoId: parentId } });
	}

	async reorderByParentId(parentId: string, ids: string[]): Promise<void> {
		await Promise.all(
			ids.map((id, index) =>
				prisma.todoSubtask.update({
					where: { id },
					data: { order: index },
				})
			)
		);
	}

	async findById(id: string): Promise<TodoSubtask | null> {
		const subtask = await prisma.todoSubtask.findUnique({ where: { id } });
		return subtask ? this.toDomain(subtask) : null;
	}

	async reorder(ids: string[]): Promise<void> {
		await Promise.all(
			ids.map((id, index) =>
				prisma.todoSubtask.update({
					where: { id },
					data: { order: index },
				})
			)
		);
	}

	async moveToPosition(id: string, position: number): Promise<TodoSubtask> {
		const updated = await prisma.todoSubtask.update({
			where: { id },
			data: { order: position },
		});
		return this.toDomain(updated);
	}

	private toDomain(subtask: {
		id: string;
		title: string;
		completed: boolean;
		todoId: string;
		order: number;
		createdAt: Date;
	}): TodoSubtask {
		return {
			id: subtask.id,
			title: subtask.title,
			completed: subtask.completed,
			todoId: subtask.todoId,
			order: subtask.order,
			createdAt: subtask.createdAt,
		};
	}
}
