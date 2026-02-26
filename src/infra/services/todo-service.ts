import type { TodoLogRepository, TodoRepository } from "@/domain/repositories/all-repository";
import { BaseEntityService, handleServiceError } from "./base/entity-service";

import type { Todo } from "@/domain/entities/todo";
import type { TodoLog } from "@/domain/entities/todo-log";
import { TodoTypeValueObject } from "@/domain/value-objects/todo-type";

// Todo form data interface
export interface TodoFormData {
	title: string;
	observations: string;
	tasks: string[];
	difficulty: Todo["difficulty"];
	startDate: Date;
	tags: string[];
}

// Todo service implementation
export class TodoService extends BaseEntityService<Todo, TodoFormData> {
	constructor(
		repository: TodoRepository,
		private todoLogRepository?: TodoLogRepository
	) {
		super(repository);
	}

	protected mapFormDataToEntity(data: TodoFormData): Omit<Todo, "id" | "createdAt" | "updatedAt"> {
		return {
			title: data.title,
			observations: data.observations,
			tasks: data.tasks,
			difficulty: data.difficulty,
			startDate: data.startDate,
			tags: data.tags,
			userId: "", // Will be set by repository
			order: 0, // Will be set by repository
			lastCompletedDate: undefined,
			recurrence: "none" as const, // Default recurrence
			todoType: TodoTypeValueObject.create("pontual"), // Default todo type
		};
	}

	// Todo-specific methods
	async completeTodo(todoId: string): Promise<{ todo: Todo; log?: TodoLog }> {
		try {
			// Get current todo
			const todos = await this.repository.list();
			const todo = todos.find((t) => t.id === todoId);
			if (!todo) {
				throw new Error("Todo not found");
			}

			// Mark as completed
			const completedTodo = await this.update(todoId, {
				lastCompletedDate: new Date().toISOString().split("T")[0]
			});

			// Create log if repository is available
			let log: TodoLog | undefined;
			if (this.todoLogRepository) {
				log = await this.todoLogRepository.create({
					todoId: todo.id,
					todoTitle: todo.title,
					difficulty: todo.difficulty,
					tags: todo.tags,
					completedAt: new Date(),
				});
			}

			return { todo: completedTodo, log };
		} catch (error) {
			return handleServiceError(error, "completar todo");
		}
	}

	async toggleComplete(todoId: string): Promise<Todo> {
		try {
			const todoRepo = this.repository as TodoRepository;
			return await todoRepo.toggleComplete(todoId);
		} catch (error) {
			return handleServiceError(error, "alternar status do todo");
		}
	}

	async findByDifficulty(difficulty: Todo["difficulty"]): Promise<Todo[]> {
		try {
			const todos = await this.repository.list();
			return todos.filter((todo) => todo.difficulty === difficulty);
		} catch (error) {
			return handleServiceError(error, "buscar todos por dificuldade");
		}
	}

	async findByTags(tags: string[]): Promise<Todo[]> {
		try {
			const todoRepo = this.repository as TodoRepository;
			return await todoRepo.findByTags(tags);
		} catch (error) {
			return handleServiceError(error, "buscar todos por tags");
		}
	}

	async findCompleted(): Promise<Todo[]> {
		try {
			const todos = await this.repository.list();
			return todos.filter((todo) => !!todo.lastCompletedDate);
		} catch (error) {
			return handleServiceError(error, "buscar todos concluídos");
		}
	}

	async findPending(): Promise<Todo[]> {
		try {
			const todos = await this.repository.list();
			return todos.filter((todo) => !todo.lastCompletedDate);
		} catch (error) {
			return handleServiceError(error, "buscar todos pendentes");
		}
	}

	async findOverdue(): Promise<Todo[]> {
		try {
			const todos = await this.repository.list();
			const now = new Date();
			return todos.filter((todo) =>
				!todo.lastCompletedDate &&
				todo.startDate &&
				todo.startDate < now
			);
		} catch (error) {
			return handleServiceError(error, "buscar todos em atraso");
		}
	}

	async reorderTodos(todoIds: string[]): Promise<void> {
		try {
			const todoRepo = this.repository as TodoRepository;
			await todoRepo.reorder(todoIds);
		} catch (error) {
			return handleServiceError(error, "reordenar todos");
		}
	}

	async addTask(todoId: string, task: string): Promise<Todo> {
		try {
			const todos = await this.repository.list();
			const todo = todos.find((t) => t.id === todoId);
			if (!todo) {
				throw new Error("Todo not found");
			}

			const updatedTasks = [...todo.tasks, task];
			return await this.update(todoId, { tasks: updatedTasks });
		} catch (error) {
			return handleServiceError(error, "adicionar tarefa");
		}
	}

	async removeTask(todoId: string, taskIndex: number): Promise<Todo> {
		try {
			const todos = await this.repository.list();
			const todo = todos.find((t) => t.id === todoId);
			if (!todo) {
				throw new Error("Todo not found");
			}

			const updatedTasks = todo.tasks.filter((_, index) => index !== taskIndex);
			return await this.update(todoId, { tasks: updatedTasks });
		} catch (error) {
			return handleServiceError(error, "remover tarefa");
		}
	}

	async updateTask(todoId: string, taskIndex: number, newTask: string): Promise<Todo> {
		try {
			const todos = await this.repository.list();
			const todo = todos.find((t) => t.id === todoId);
			if (!todo) {
				throw new Error("Todo not found");
			}

			const updatedTasks = [...todo.tasks];
			updatedTasks[taskIndex] = newTask;
			return await this.update(todoId, { tasks: updatedTasks });
		} catch (error) {
			return handleServiceError(error, "atualizar tarefa");
		}
	}
}
