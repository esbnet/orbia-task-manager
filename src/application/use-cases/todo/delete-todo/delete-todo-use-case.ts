import type { TodoRepository } from "@/domain/repositories/all-repository";

export class DeleteTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(id: string): Promise<void> {
		await this.todoRepository.delete(id);
		return;
	}
}
