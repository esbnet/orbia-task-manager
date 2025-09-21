"use client";

import { CreateDailySubtaskUseCase } from "@/application/use-cases/daily-subtask/create-daily-subtask/create-daily-subtask-use-case";
import { DeleteDailySubtaskUseCase } from "@/application/use-cases/daily-subtask/delete-daily-subtask/delete-daily-subtask-use-case";
import { UpdateDailySubtaskUseCase } from "@/application/use-cases/daily-subtask/update-daily-subtask/update-daily-subtask-use-case";
import { TaskTitle } from "@/domain/value-objects/task-title";
import { ApiDailySubtaskRepository } from "@/infra/repositories/http/api-daily-subtask-repository";
import { ErrorHandler } from "@/infra/services/error-handler";
import type { DailySubtask } from "@/types";
import { type ReactNode, createContext, useContext } from "react";

interface DailySubtaskContextType {
	createSubtask: (
		title: string,
		dailyId: string,
		order: number,
	) => Promise<DailySubtask>;
	updateSubtask: (subtask: DailySubtask) => Promise<DailySubtask>;
	deleteSubtask: (id: string) => Promise<void>;
}

const DailySubtaskContext = createContext<DailySubtaskContextType | undefined>(
	undefined,
);

const dailySubtaskRepository = new ApiDailySubtaskRepository();
const createUseCase = new CreateDailySubtaskUseCase(dailySubtaskRepository);
const updateUseCase = new UpdateDailySubtaskUseCase(dailySubtaskRepository);
const deleteUseCase = new DeleteDailySubtaskUseCase(dailySubtaskRepository);

export function DailySubtaskProvider({ children }: { children: ReactNode }) {
	const createSubtask = async (
		title: string,
		dailyId: string,
		order: number,
	): Promise<DailySubtask> => {
		try {
			const taskTitle = TaskTitle.create(title);
			const result = await createUseCase.execute({
				title: taskTitle.getValue(),
				dailyId,
				order,
			});
			return result.subtask;
		} catch (error) {
			console.error("DailySubtaskContext.createSubtask:", error);
			throw error instanceof Error ? error : new Error("Erro ao criar subtarefa");
		}
	};

	const updateSubtask = async (
		subtask: DailySubtask,
	): Promise<DailySubtask> => {
		try {
			const result = await updateUseCase.execute({ subtask });

			return result.subtask;
		} catch (error) {
			console.error("DailySubtaskContext.updateSubtask:", error);
			throw error instanceof Error ? error : new Error("Erro ao atualizar subtarefa");
		}
	};

	const deleteSubtask = async (id: string): Promise<void> => {
		try {
			await deleteUseCase.execute({ id });
		} catch (error) {
			console.error("DailySubtaskContext.deleteSubtask:", error);
			throw error instanceof Error ? error : new Error("Erro ao deletar subtarefa");
		}
	};

	return (
		<DailySubtaskContext.Provider
			value={{ createSubtask, updateSubtask, deleteSubtask }}
		>
			{children}
		</DailySubtaskContext.Provider>
	);
}

export function useDailySubtaskContext() {
	const context = useContext(DailySubtaskContext);
	if (!context) {
		throw new Error(
			"useDailySubtaskContext must be used within DailySubtaskProvider",
		);
	}
	return context;
}
