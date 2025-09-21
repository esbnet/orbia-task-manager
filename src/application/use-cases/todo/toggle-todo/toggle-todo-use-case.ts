import type { TodoRepository } from "@/domain/repositories/all-repository";
import type { TodoOutput } from "./toggle-todo-dto";

export class ToggleTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(id: string): Promise<TodoOutput> {
		const todo = await this.todoRepository.toggleComplete(id);

		return { todo };
	}
}
