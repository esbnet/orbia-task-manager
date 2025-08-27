import type { TodoRepository } from "@/domain/repositories/all-repository";

export interface DeleteTodoInput {
	id: string;
}

export interface DeleteTodoOutput {
	success: boolean;
}

export class DeleteTodoUseCase {
	constructor(private todoRepository: TodoRepository) {}

	async execute(input: DeleteTodoInput): Promise<DeleteTodoOutput> {
		await this.todoRepository.delete(input.id);
		return { success: true };
	}
}
