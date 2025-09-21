import type { Todo, TodoSubtask } from "@/domain/entities/todo";

import type { TodoRepository } from "@/domain/repositories/all-repository";
import type { CreateEntityData } from "@/domain/repositories/base-repository";

export class InMemoryTodoRepository implements TodoRepository {
	private todos: Todo[] = [];
	private subtasks: TodoSubtask[] = [];
	private nextId = 1;
	private nextSubtaskId = 1;

	async list(): Promise<Todo[]> {
		return [...this.todos];
	}

	async findById(id: string): Promise<Todo | null> {
		const todo = this.todos.find(t => t.id === id);
		return todo || null;
	}

	async create(data: CreateEntityData<Todo>): Promise<Todo> {
		const todo: Todo = {
			...data,
			id: this.nextId.toString(),
			createdAt: new Date(),
		};
		this.todos.push(todo);
		this.nextId++;
		return todo;
	}

	async update(todo: Todo): Promise<Todo> {
		const index = this.todos.findIndex(t => t.id === todo.id);
		if (index === -1) {
			throw new Error("Todo not found");
		}
		const updatedTodo = { ...todo, updatedAt: new Date() };
		this.todos[index] = updatedTodo;
		return updatedTodo;
	}

	async delete(id: string): Promise<void> {
		const index = this.todos.findIndex(t => t.id === id);
		if (index === -1) {
			throw new Error("Todo not found");
		}
		this.todos.splice(index, 1);
		// Also remove associated subtasks
		this.subtasks = this.subtasks.filter(st => st.todoId !== id);
	}

	// UserOwnedRepository methods
	async findByUserId(userId: string): Promise<Todo[]> {
		return this.todos.filter(t => t.userId === userId);
	}

	async deleteByUserId(userId: string): Promise<void> {
		this.todos = this.todos.filter(t => t.userId !== userId);
		this.subtasks = this.subtasks.filter(st => {
			const todo = this.todos.find(t => t.id === st.todoId);
			return todo?.userId !== userId;
		});
	}

	// CompletableRepository methods
	async toggleComplete(id: string): Promise<Todo> {
		const todo = await this.findById(id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		// For todos, completion is handled differently - could be based on subtasks
		// For simplicity, we'll just toggle a completed state
		const updatedTodo = { ...todo, updatedAt: new Date() };
		return this.update(updatedTodo);
	}

	async markComplete(id: string): Promise<Todo> {
		const todo = await this.findById(id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		const updatedTodo = { ...todo, updatedAt: new Date() };
		return this.update(updatedTodo);
	}

	async markIncomplete(id: string): Promise<Todo> {
		const todo = await this.findById(id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		const updatedTodo = { ...todo, updatedAt: new Date() };
		return this.update(updatedTodo);
	}

	// OrderableRepository methods
	async reorder(ids: string[]): Promise<void> {
		const reorderedTodos: Todo[] = [];
		for (const id of ids) {
			const todo = this.todos.find(t => t.id === id);
			if (todo) {
				reorderedTodos.push({ ...todo, order: reorderedTodos.length });
			}
		}
		this.todos = reorderedTodos;
	}

	async moveToPosition(id: string, position: number): Promise<Todo> {
		const todo = await this.findById(id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		const updatedTodo = { ...todo, order: position, updatedAt: new Date() };
		return this.update(updatedTodo);
	}

	// TaggableRepository methods
	async findByTags(tags: string[]): Promise<Todo[]> {
		return this.todos.filter(todo =>
			tags.some(tag => todo.tags.includes(tag))
		);
	}

	async findByTag(tag: string): Promise<Todo[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const tagCounts: { [key: string]: number } = {};

		this.todos.forEach((todo) => {
			todo.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		return Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	}

	// Utility methods for testing
	clear(): void {
		this.todos = [];
		this.subtasks = [];
		this.nextId = 1;
		this.nextSubtaskId = 1;
	}

	getAll(): Todo[] {
		return [...this.todos];
	}

	addTodo(todo: Todo): void {
		this.todos.push(todo);
		if (parseInt(todo.id) >= this.nextId) {
			this.nextId = parseInt(todo.id) + 1;
		}
	}

	getSubtasksByTodoId(todoId: string): TodoSubtask[] {
		return this.subtasks.filter(st => st.todoId === todoId);
	}
}