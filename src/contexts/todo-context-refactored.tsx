"use client";

import type { Todo } from "@/domain/entities/todo";
import type { TodoFormData } from "@/services/todo-service";
import React from "react";
import { createEntityContext } from "./base/entity-context-factory";

// Create HTTP-based service for client-side usage
const httpTodoService = {
	async list(): Promise<Todo[]> {
		const response = await fetch('/api/todos');
		if (!response.ok) {
			throw new Error('Failed to fetch todos');
		}
		const data = await response.json();
		return data.todos || [];
	},

	async create(data: TodoFormData): Promise<Todo> {
		const response = await fetch('/api/todos', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error('Failed to create todo');
		}
		const result = await response.json();
		return result.todo;
	},

	async update(id: string, data: Partial<Todo>): Promise<Todo> {
		const response = await fetch(`/api/todos`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ todo: { id, ...data } }),
		});
		if (!response.ok) {
			throw new Error('Failed to update todo');
		}
		const result = await response.json();
		return result.todo;
	},

	async delete(id: string): Promise<void> {
		const response = await fetch(`/api/todos?id=${id}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to delete todo');
		}
	},

	// Todo-specific HTTP methods
	async completeTodo(id: string): Promise<void> {
		const response = await fetch(`/api/todos/${id}/complete`, {
			method: 'PATCH',
		});
		if (!response.ok) {
			throw new Error('Failed to complete todo');
		}
	},

	async toggleComplete(id: string): Promise<void> {
		const response = await fetch(`/api/todos/${id}/toggle`, {
			method: 'PATCH',
		});
		if (!response.ok) {
			throw new Error('Failed to toggle todo');
		}
	},

	async reorderTodos(ids: string[]): Promise<void> {
		const response = await fetch('/api/todos/reorder', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ ids }),
		});
		if (!response.ok) {
			throw new Error('Failed to reorder todos');
		}
	},

	async addTask(todoId: string, task: string): Promise<void> {
		const response = await fetch(`/api/todos/${todoId}/tasks`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ task }),
		});
		if (!response.ok) {
			throw new Error('Failed to add task');
		}
	},

	async removeTask(todoId: string, taskIndex: number): Promise<void> {
		const response = await fetch(`/api/todos/${todoId}/tasks/${taskIndex}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to remove task');
		}
	},

	async updateTask(todoId: string, taskIndex: number, newTask: string): Promise<void> {
		const response = await fetch(`/api/todos/${todoId}/tasks/${taskIndex}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ task: newTask }),
		});
		if (!response.ok) {
			throw new Error('Failed to update task');
		}
	},
};

// Create context using factory
const {
	// Context: TodoContext,
	Provider: BaseTodoProvider,
	useContext: useBaseTodos,
} = createEntityContext<Todo, TodoFormData>({
	entityName: "Todo",
	service: httpTodoService,
	enableCache: true,
	cacheTimeout: 5 * 60 * 1000, // 5 minutes
});

// Extended context type with todo-specific methods
interface ExtendedTodoContextType {
	todos: Todo[];
	loading: boolean;
	error: string | null;
	createTodo: (data: TodoFormData) => Promise<void>;
	updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
	deleteTodo: (id: string) => Promise<void>;
	refreshTodos: () => Promise<void>;
	// Todo-specific methods
	completeTodo: (todoId: string) => Promise<void>;
	toggleComplete: (todoId: string) => Promise<void>;
	getCompletedTodos: () => Todo[];
	getPendingTodos: () => Todo[];
	getOverdueTodos: () => Todo[];
	getTodosByDifficulty: (difficulty: Todo["difficulty"]) => Todo[];
	reorderTodos: (todoIds: string[]) => Promise<void>;
	addTask: (todoId: string, task: string) => Promise<void>;
	removeTask: (todoId: string, taskIndex: number) => Promise<void>;
	updateTask: (todoId: string, taskIndex: number, newTask: string) => Promise<void>;
}

// Enhanced provider with todo-specific functionality
export function TodoProvider({ children }: { children: React.ReactNode }) {
	return (
		<BaseTodoProvider>
			<TodoContextEnhancer>{children}</TodoContextEnhancer>
		</BaseTodoProvider>
	);
}

// Context enhancer component
function TodoContextEnhancer({ children }: { children: React.ReactNode }) {
	const baseContext = useBaseTodos();

	// Todo-specific methods
	const completeTodo = async (todoId: string) => {
		await httpTodoService.completeTodo(todoId);
		await baseContext.refresh();
	};

	const toggleComplete = async (todoId: string) => {
		await httpTodoService.toggleComplete(todoId);
		await baseContext.refresh();
	};

	const getCompletedTodos = () => {
		return baseContext.entities.filter((todo) => todo.lastCompletedDate);
	};

	const getPendingTodos = () => {
		return baseContext.entities.filter((todo) => !todo.lastCompletedDate);
	};

	const getOverdueTodos = () => {
		const now = new Date();
		return baseContext.entities.filter(
			(todo) => !todo.lastCompletedDate && todo.startDate && todo.startDate < now
		);
	};

	const getTodosByDifficulty = (difficulty: Todo["difficulty"]) => {
		return baseContext.entities.filter((todo) => todo.difficulty === difficulty);
	};

	const reorderTodos = async (todoIds: string[]) => {
		await httpTodoService.reorderTodos(todoIds);
		await baseContext.refresh();
	};

	const addTask = async (todoId: string, task: string) => {
		await httpTodoService.addTask(todoId, task);
		await baseContext.refresh();
	};

	const removeTask = async (todoId: string, taskIndex: number) => {
		await httpTodoService.removeTask(todoId, taskIndex);
		await baseContext.refresh();
	};

	const updateTask = async (todoId: string, taskIndex: number, newTask: string) => {
		await httpTodoService.updateTask(todoId, taskIndex, newTask);
		await baseContext.refresh();
	};

	// Enhanced context value
	const enhancedContext: ExtendedTodoContextType = {
		todos: baseContext.entities,
		loading: baseContext.loading,
		error: baseContext.error,
		createTodo: baseContext.create,
		updateTodo: baseContext.update,
		deleteTodo: baseContext.delete,
		refreshTodos: baseContext.refresh,
		completeTodo,
		toggleComplete,
		getCompletedTodos,
		getPendingTodos,
		getOverdueTodos,
		getTodosByDifficulty,
		reorderTodos,
		addTask,
		removeTask,
		updateTask,
	};

	return (
		<EnhancedTodoContext.Provider value={enhancedContext}>
			{children}
		</EnhancedTodoContext.Provider>
	);
}

// Enhanced context
const EnhancedTodoContext = React.createContext<ExtendedTodoContextType | undefined>(undefined);

// Hook to use enhanced todo context
export function useTodos(): ExtendedTodoContextType {
	const context = React.useContext(EnhancedTodoContext);
	if (context === undefined) {
		throw new Error("useTodos deve ser usado dentro de um TodoProvider");
	}
	return context;
}

// Export for backward compatibility
export { useTodos as useTodoContext };
