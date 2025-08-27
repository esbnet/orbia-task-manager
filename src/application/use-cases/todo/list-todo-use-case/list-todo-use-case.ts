import type { Todo } from "@/domain/entities/todo";
import type { TodoRepository } from "@/domain/repositories/all-repository";

export interface ListTodoOutput {
	todos: Todo[];
}

export class ListTodoUseCase {
	constructor(private todoRepository: TodoRepository) {}

	async execute(): Promise<ListTodoOutput> {
		const todos = await this.todoRepository.list();
		return { todos };
	}
}
