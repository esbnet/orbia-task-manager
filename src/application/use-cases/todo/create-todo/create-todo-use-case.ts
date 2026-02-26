import type {
	CreateTodoInput,
	CreateTodoOutput,
	TodoDifficulty,
} from "./create-todo-dto";

import type { TodoRepository } from "@/domain/repositories/all-repository";
import { TodoTypeValueObject } from "@/domain/value-objects/todo-type";

export class CreateTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(inputTodo: CreateTodoInput): Promise<CreateTodoOutput> {
		const todo = await this.todoRepository.create({
			userId: inputTodo.userId,
			title: inputTodo.title,
			observations: inputTodo.observations,
			tasks: inputTodo.tasks,
			difficulty: inputTodo.difficulty as TodoDifficulty,
			startDate: inputTodo.startDate,
			tags: inputTodo.tags,
			recurrence: (inputTodo.recurrence || "none") as any,
			todoType: TodoTypeValueObject.create((inputTodo.todoType || "pontual") as any),
		});

		return {
			todo: {
				id: todo.id,
				userId: todo.userId,
				title: todo.title,
				observations: todo.observations,
				tasks: todo.tasks,
				difficulty: todo.difficulty,
				startDate: todo.startDate,
				tags: todo.tags,
				createdAt: todo.createdAt,
				recurrence: todo.recurrence as any,
				todoType: todo.todoType.getValue(),
			},
		};
	}
}
