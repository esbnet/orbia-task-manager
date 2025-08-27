import type { TodoSubtask } from "@/domain/entities/todo-subtask";
import type { TodoSubtaskRepository } from "@/domain/repositories/all-repository";

export interface CreateTodoSubtaskInput {
	title: string;
	todoId: string;
	order: number;
}

export interface CreateTodoSubtaskOutput {
	subtask: TodoSubtask;
}

export class CreateTodoSubtaskUseCase {
	constructor(private todoSubtaskRepository: TodoSubtaskRepository) {}

	async execute(
		input: CreateTodoSubtaskInput,
	): Promise<CreateTodoSubtaskOutput> {
		const subtask = await this.todoSubtaskRepository.create({
			title: input.title,
			completed: false,
			todoId: input.todoId,
			order: input.order,
		});

		return { subtask };
	}
}
