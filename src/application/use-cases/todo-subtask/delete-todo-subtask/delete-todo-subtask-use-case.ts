import type { TodoSubtaskRepository } from "@/domain/repositories/all-repository";

export interface DeleteTodoSubtaskInput {
	id: string;
}

export interface DeleteTodoSubtaskOutput {
	success: boolean;
}

export class DeleteTodoSubtaskUseCase {
	constructor(private todoSubtaskRepository: TodoSubtaskRepository) {}

	async execute(
		input: DeleteTodoSubtaskInput,
	): Promise<DeleteTodoSubtaskOutput> {
		await this.todoSubtaskRepository.delete(input.id);
		return { success: true };
	}
}
