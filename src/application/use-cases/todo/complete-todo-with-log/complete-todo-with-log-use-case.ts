import type { Todo } from "@/domain/entities/todo";
import type {
	TodoLogRepository,
	TodoRepository,
} from "@/domain/repositories/all-repository";

export interface CompleteTodoWithLogInput {
	todo: Todo;
}

export interface CompleteTodoWithLogOutput {
	success: boolean;
	updatedTodo: Todo;
}

export class CompleteTodoWithLogUseCase {
	constructor(
		private todoRepository: TodoRepository,
		private todoLogRepository: TodoLogRepository,
	) {}

	async execute(
		input: CompleteTodoWithLogInput,
	): Promise<CompleteTodoWithLogOutput> {
		// Create log
		await this.todoLogRepository.create({
			todoId: input.todo.id,
			todoTitle: input.todo.title,
			difficulty: input.todo.difficulty,
			tags: input.todo.tags,
			completedAt: new Date(),
		});

		// Update todo with completion date
		const today = new Date().toISOString().split("T")[0];
		const updatedTodo = { ...input.todo, lastCompletedDate: today };
		const result = await this.todoRepository.update(updatedTodo);

		return {
			success: true,
			updatedTodo: result,
		};
	}
}
