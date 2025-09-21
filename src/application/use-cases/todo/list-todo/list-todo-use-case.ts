import type { TodoRepository } from "@/domain/repositories/all-repository";
import type { ListTodosOutput } from "./list-todo-dto";

export class ListTodosUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(): Promise<ListTodosOutput> {
		const todos = await this.todoRepository.list();

		return { todos };
	}
}
