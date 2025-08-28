import type { TodoLog } from "@/domain/entities/todo-log";
import type { TodoLogRepository } from "@/domain/repositories/all-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaTodoLogRepository implements TodoLogRepository {
	async list(): Promise<TodoLog[]> {
		const logs = await prisma.todoLog.findMany({
			orderBy: { completedAt: "desc" },
		});
		return logs.map(this.toDomain);
	}

	async create(data: Omit<TodoLog, "id" | "createdAt">): Promise<TodoLog> {
		const log = await prisma.todoLog.create({
			data: {
				todoId: data.todoId,
				todoTitle: data.todoTitle,
				difficulty: data.difficulty,
				tags: data.tags,
				completedAt: data.completedAt,
			},
		});
		return this.toDomain(log);
	}

	
	async update(_log: TodoLog): Promise<TodoLog> {
		throw new Error("Update not implemented for todo logs");
	}

	
	async toggleComplete(_id: string): Promise<TodoLog> {
		throw new Error("Toggle complete not implemented for todo logs");
	}

	async delete(id: string): Promise<void> {
		await prisma.todoLog.delete({ where: { id } });
	}

	private toDomain(log: {
		id: string;
		todoId: string;
		todoTitle: string;
		difficulty: string;
		tags: string[];
		completedAt: Date;
	}): TodoLog {
		return {
			id: log.id,
			todoId: log.todoId,
			todoTitle: log.todoTitle,
			difficulty: log.difficulty,
			tags: log.tags,
			completedAt: log.completedAt,
			createdAt: log.completedAt, // Usando completedAt como createdAt já que o schema não tem createdAt
		};
	}
}
