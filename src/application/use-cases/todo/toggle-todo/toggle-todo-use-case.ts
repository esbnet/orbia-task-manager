import type { TodoLogRepository, TodoRepository } from "@/domain/repositories/all-repository";

import type { TodoOutput } from "./toggle-todo-dto";

export class ToggleTodoUseCase {
	constructor(
		private readonly todoRepository: TodoRepository,
		private readonly todoLogRepository: TodoLogRepository
	) {}

	async execute(id: string): Promise<TodoOutput> {
		// Buscar o todo atual para obter os dados necessários para o log
		const currentTodo = await this.todoRepository.findById(id);
		if (!currentTodo) {
			throw new Error("Todo not found");
		}

		// Determinar se está completando ou desmarcando
		const isCompleting = !currentTodo.lastCompletedDate;

		// Se estiver completando, criar log
		if (isCompleting) {
			await this.todoLogRepository.create({
				todoId: currentTodo.id,
				todoTitle: currentTodo.title,
				difficulty: currentTodo.difficulty,
				tags: currentTodo.tags,
				completedAt: new Date(),
			});
		}

		// Atualizar o todo
		const todo = await this.todoRepository.toggleComplete(id);

		return { todo };
	}
}
