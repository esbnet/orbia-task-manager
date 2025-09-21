import type { TodoSubtask } from "@/domain/entities/todo-subtask";
import type { TodoSubtaskRepository } from "@/domain/repositories/all-repository";

export interface ListTodoSubtaskInput {
	todoId: string;
}

export interface ListTodoSubtaskOutput {
	subtasks: TodoSubtask[];
}

export class ListTodoSubtaskUseCase {
	constructor(private todoSubtaskRepository: TodoSubtaskRepository) {}

	async execute(input: ListTodoSubtaskInput): Promise<ListTodoSubtaskOutput> {
		const subtasks = await this.todoSubtaskRepository.listByTodoId(
			input.todoId,
		);
		return { subtasks };
	}
}
