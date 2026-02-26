import type { UpdateTodoInput, UpdateTodoOutput } from "./update-todo-dto";

import type { Todo } from "@/domain/entities/todo";
import type { TodoRepository } from "@/domain/repositories/all-repository";
import { TodoTypeValueObject } from "@/domain/value-objects/todo-type";

export class UpdateTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(inputTodo: UpdateTodoInput): Promise<UpdateTodoOutput> {
		// Buscar o todo existente pelo ID
		const existingTodo = await this.todoRepository.findById(inputTodo.id);

		if (!existingTodo) {
			throw new Error(`Todo com ID ${inputTodo.id} não encontrado`);
		}

		// Criar o objeto Todo atualizado com os dados do input
		const updatedTodo: Todo = {
			...existingTodo,
			title: inputTodo.title,
			observations: inputTodo.observations,
			tasks: inputTodo.tasks,
			difficulty: inputTodo.difficulty,
			startDate: inputTodo.startDate,
			tags: inputTodo.tags,
			recurrence: inputTodo.recurrence,
			recurrenceInterval: inputTodo.recurrenceInterval,
			// Converter string para TodoTypeValueObject
			todoType: TodoTypeValueObject.create(inputTodo.todoType),
		};

		const todo = await this.todoRepository.update(updatedTodo);

		// Converter o Todo para UpdateTodoOutput
		return {
			id: todo.id,
			userId: todo.userId,
			title: todo.title,
			observations: todo.observations,
			tasks: todo.tasks,
			difficulty: todo.difficulty,
			startDate: todo.startDate,
			tags: todo.tags,
			createdAt: todo.createdAt,
			recurrence: todo.recurrence,
			recurrenceInterval: todo.recurrenceInterval,
			todoType: todo.todoType.getValue(), // Converter TodoTypeValueObject para string
		};
	}
}
