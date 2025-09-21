"use client";

import { CreateTodoSubtaskUseCase } from "@/application/use-cases/todo-subtask/create-todo-subtask/create-todo-subtask-use-case";
import { DeleteTodoSubtaskUseCase } from "@/application/use-cases/todo-subtask/delete-todo-subtask/delete-todo-subtask-use-case";
import { UpdateTodoSubtaskUseCase } from "@/application/use-cases/todo-subtask/update-todo-subtask/update-todo-subtask-use-case";
import { TaskTitle } from "@/domain/value-objects/task-title";
import { ApiTodoSubtaskRepository } from "@/infra/repositories/http/api-todo-subtask-repository";
import { ErrorHandler } from "@/infra/services/error-handler";
import type { TodoSubtask } from "@/types";
import { type ReactNode, createContext, useContext } from "react";

interface TodoSubtaskContextType {
	createSubtask: (
		title: string,
		todoId: string,
		order: number,
	) => Promise<TodoSubtask>;
	updateSubtask: (subtask: TodoSubtask) => Promise<TodoSubtask>;
	deleteSubtask: (id: string) => Promise<void>;
	refreshTodos?: () => Promise<void>;
}

const TodoSubtaskContext = createContext<TodoSubtaskContextType | undefined>(
	undefined,
);

const todoSubtaskRepository = new ApiTodoSubtaskRepository();
const createUseCase = new CreateTodoSubtaskUseCase(todoSubtaskRepository);
const updateUseCase = new UpdateTodoSubtaskUseCase(todoSubtaskRepository);
const deleteUseCase = new DeleteTodoSubtaskUseCase(todoSubtaskRepository);

interface TodoSubtaskProviderProps {
	children: ReactNode;
	refreshTodos?: () => Promise<void>;
}

export function TodoSubtaskProvider({
	children,
	refreshTodos,
}: TodoSubtaskProviderProps) {
	const createSubtask = async (
		title: string,
		todoId: string,
		order: number,
	): Promise<TodoSubtask> => {
		try {
			const taskTitle = TaskTitle.create(title);
			const result = await createUseCase.execute({
				title: taskTitle.getValue(),
				todoId,
				order,
			});
			return result.subtask;
		} catch (error) {
			console.error("TodoSubtaskContext.createSubtask:", error);
			throw error instanceof Error ? error : new Error("Erro ao criar subtarefa");
		}
	};

	const updateSubtask = async (
		subtask: TodoSubtask,
	): Promise<TodoSubtask> => {
		try {
			const result = await updateUseCase.execute({ subtask });
			return result.subtask;
		} catch (error) {
			console.error("TodoSubtaskContext.updateSubtask:", error);
			throw error instanceof Error ? error : new Error("Erro ao atualizar subtarefa");
		}
	};

	const deleteSubtask = async (id: string): Promise<void> => {
		try {
			await deleteUseCase.execute({ id });
		} catch (error) {
			console.error("TodoSubtaskContext.deleteSubtask:", error);
			throw error instanceof Error ? error : new Error("Erro ao deletar subtarefa");
		}
	};

	return (
		<TodoSubtaskContext.Provider
			value={{
				createSubtask,
				updateSubtask,
				deleteSubtask,
				refreshTodos,
			}}
		>
			{children}
		</TodoSubtaskContext.Provider>
	);
}

export function useTodoSubtaskContext() {
	const context = useContext(TodoSubtaskContext);
	if (!context) {
		throw new Error(
			"useTodoSubtaskContext must be used within TodoSubtaskProvider",
		);
	}
	return context;
}
