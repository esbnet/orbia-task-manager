import type { Daily } from "@/domain/entities/daily";
import type { DailyRepository } from "@/domain/repositories/all-repository";
import { InMemoryGenericRepository } from "./in-memory-generic-repository";

export class InMemoryDailyRepository
	extends InMemoryGenericRepository<Daily>
	implements DailyRepository
{
	constructor() {
		super();
		// Inicializar com dados de exemplo se necessário
		this.items = [
			{
				id: "1",
				title: "Daily task example",
				// adicione outras propriedades específicas do Daily aqui
				observations: "This is an example observation.",
				tasks: ["Task 1", "Task 2"],
				difficulty: "Fácil",
				startDate: new Date(),
				repeat: {
					type: "Diariamente",
					frequency: 1,
				},
				tags: ["example", "daily"],
				createdAt: new Date(),
				userId: "1", // ID do usuário que criou a tarefa					
			},
		];
	}
	findByUserId(userId: string): Promise<Daily[]> {
		throw new Error("Method not implemented.");
	}
	deleteByUserId(userId: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	findById(id: string): Promise<Daily | null> {
		throw new Error("Method not implemented.");
	}
	markComplete(id: string): Promise<Daily> {
		throw new Error("Method not implemented.");
	}
	markIncomplete(id: string): Promise<Daily> {
		throw new Error("Method not implemented.");
	}
	reorder(ids: string[]): Promise<void> {
		throw new Error("Method not implemented.");
	}
	moveToPosition(id: string, position: number): Promise<Daily> {
		throw new Error("Method not implemented.");
	}
	findByTags(tags: string[]): Promise<Daily[]> {
		throw new Error("Method not implemented.");
	}
	findByTag(tag: string): Promise<Daily[]> {
		throw new Error("Method not implemented.");
	}
}
