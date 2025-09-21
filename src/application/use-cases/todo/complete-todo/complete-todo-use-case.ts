import type { Todo } from "@/domain/entities/todo";
import type { TodoLogRepository } from "@/domain/repositories/all-repository";

export interface CompleteTodoInput {
	todo: Todo;
}

export interface CompleteTodoOutput {
	success: boolean;
	logId: string;
}

export class CompleteTodoUseCase {
	constructor(private todoLogRepository: TodoLogRepository) {}

	async execute(input: CompleteTodoInput): Promise<CompleteTodoOutput> {
		const log = await this.todoLogRepository.create({
			todoId: input.todo.id,
			todoTitle: input.todo.title,
			difficulty: input.todo.difficulty,
			tags: input.todo.tags,
			completedAt: new Date(),
		});

		return {
			success: true,
			logId: log.id,
		};
	}
}
