import type { UpdateTodoInput, UpdateTodoOutput } from "./update-todo-dto";

import type { TodoRepository } from "@/domain/repositories/all-repository";

export class UpdateTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(inputTodo: UpdateTodoInput): Promise<UpdateTodoOutput> {
		const todo = await this.todoRepository.update(inputTodo);

		return todo;
	}
}
