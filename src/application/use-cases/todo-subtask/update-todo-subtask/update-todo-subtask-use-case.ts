import type { TodoSubtask } from "@/domain/entities/todo-subtask";
import type { TodoSubtaskRepository } from "@/domain/repositories/all-repository";

export interface UpdateTodoSubtaskInput {
	subtask: TodoSubtask;
}

export interface UpdateTodoSubtaskOutput {
	subtask: TodoSubtask;
}

export class UpdateTodoSubtaskUseCase {
	constructor(private todoSubtaskRepository: TodoSubtaskRepository) {}

	async execute(
		input: UpdateTodoSubtaskInput,
	): Promise<UpdateTodoSubtaskOutput> {
		const subtask = await this.todoSubtaskRepository.update(input.subtask);
		return { subtask };
	}
}
