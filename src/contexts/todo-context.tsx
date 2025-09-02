"use client";

import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

import type { Todo } from "@/types";

import { CompleteTodoWithLogUseCase } from "@/application/use-cases/todo/complete-todo-with-log/complete-todo-with-log-use-case";
import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/delete-todo/delete-todo-use-case";
import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { UpdateTodoUseCase } from "@/application/use-cases/todo/update-todo/update-todo-use-case";
import { ApiTodoLogRepository } from "@/infra/repositories/http/api-todo-log-repository";
import { ApiTodoRepository } from "@/infra/repositories/http/api-todo-repository";

interface TodoContextType {
	todos: Todo[];
	isLoading: boolean;
	error: string | null;
	addTodo: (todo: Omit<Todo, "id" | "createdAt">) => Promise<void>;
	updateTodo: (todo: Todo) => Promise<void>;
	deleteTodo: (id: string) => Promise<void>;
	toggleComplete: (id: string) => Promise<void>;
	getTodo: (id: string) => Todo | undefined;
	reorderTodos: (todos: Todo[]) => Promise<void>;
	completeTodo: (todo: Todo) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoProviderProps {
	children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const todoRepository = new ApiTodoRepository();
	const createTodoUseCase = new CreateTodoUseCase(todoRepository);
	const updateTodoUseCase = new UpdateTodoUseCase(todoRepository);
	const deleteTodoUseCase = new DeleteTodoUseCase(todoRepository);
	const listTodosUseCase = new ListTodosUseCase(todoRepository);

	const fetchTodos = async () => {
		try {
			setIsLoading(true);
			const result = await listTodosUseCase.execute();
			setTodos(result.todos as unknown as Todo[]);
			setError(null);
		} catch (err) {
			setError("Failed to fetch todos");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTodos();

	}, []);

	const addTodo = async (todo: Omit<Todo, "id" | "createdAt">) => {
		try {
			const result = await createTodoUseCase.execute({
				userId: todo.userId,
				title: todo.title,
				observations: todo.observations || "",
				tasks: todo.tasks || ([] as string[]),
				difficulty: todo.difficulty || "Fácil",
				startDate: todo.startDate || new Date(),
				tags: todo.tags || [],
				createdAt: new Date(),
			});
			setTodos((prevTodos) => [
				...prevTodos,
				result.todo as unknown as Todo,
			]);
		} catch (err) {
			setError("Failed to add todo");
		}
	};

	const updateTodo = async (todo: Todo) => {
		try {
			const updatedTodoOutput = await updateTodoUseCase.execute(todo); // returns UpdateTodoOutput
			const updatedTodo: Todo = {
				...todo,
				...updatedTodoOutput,
			};
			setTodos((prevTodos) =>
				prevTodos.map((t) =>
					t.id === updatedTodo.id ? updatedTodo : t,
				),
			);
		} catch (err) {
			setError("Failed to update todo");
		}
	};

	const deleteTodo = async (id: string) => {
		try {
			await deleteTodoUseCase.execute(id);
			setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
		} catch (err) {
			setError("Failed to delete todo");
		}
	};

	const toggleComplete = async (id: string) => {
		try {
			const updatedTodoFromRepo = await todoRepository.toggleComplete(id);

			const updatedTodo: Todo = {
				...updatedTodoFromRepo,
			} as Todo;

			setTodos((prevTodos) =>
				prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo)),
			);
		} catch (err) {
			setError("Falha ao completar tarefa");
		}
	};

	const getTodo = (id: string) => {
		return todos.find((todo) => todo.id === id);
	};

	const reorderTodos = async (reorderedTodos: Todo[]) => {
		try {
			const todosWithOrder = reorderedTodos.map((todo, index) => ({
				...todo,
				order: index,
			}));

			setTodos(todosWithOrder);

			for (const todo of todosWithOrder) {
				await updateTodoUseCase.execute(todo);
			}
		} catch (err) {
			setError("Failed to reorder todos");
		}
	};

	const completeTodo = async (todo: Todo) => {
		try {
			const completeTodoWithLogUseCase = new CompleteTodoWithLogUseCase(
				todoRepository,
				new ApiTodoLogRepository(),
			);

			const result = await completeTodoWithLogUseCase.execute({ todo });
			setTodos((prevTodos) =>
				prevTodos.map((t) =>
					t.id === todo.id ? result.updatedTodo : t,
				),
			);
		} catch (err) {
			setError("Failed to complete todo");
		}
	};

	const today = new Date().toISOString().split("T")[0];
	const visibleTodos = todos.filter(
		(todo) => todo.lastCompletedDate !== today,
	);

	const value = {
		todos: visibleTodos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		isLoading,
		error,
		addTodo,
		updateTodo,
		deleteTodo,
		toggleComplete,
		getTodo,
		reorderTodos,
		completeTodo,
	};

	return (
		<TodoContext.Provider value={value}>{children}</TodoContext.Provider>
	);
}

// Custom hook to use the TodoContext
export function useTodoContext() {
	const context = useContext(TodoContext);
	if (context === undefined) {
		throw new Error("useTodoContext must be used within a TodoProvider");
	}
	return context;
}
