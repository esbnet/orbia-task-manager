"use client";

import { useCreateGoal, useDeleteGoal, useGoals as useGoalsQuery, useUpdateGoal } from "@/hooks/use-goals";
import React, { createContext, useContext } from "react";

import type { Goal } from "@/domain/entities/goal";
import { taskCountKeys } from "@/hooks/use-task-counts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface GoalFormData {
	title: string;
	description: string;
	targetDate: Date;
	priority: Goal["priority"];
	tags: string[];
	attachedTasks?: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>;
}

interface GoalContextType {
	goals: Goal[];
	loading: boolean;
	error: string | null;
	createGoal: (data: GoalFormData) => Promise<void>;
	updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
	deleteGoal: (id: string) => Promise<void>;
	refreshGoals: () => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();

	// Usar o hook useGoals para obter dados e estado
	const { data: goals = [], isLoading: loading, error: queryError } = useGoalsQuery();

	// Usar as mutations do React Query
	const createMutation = useCreateGoal();
	const updateMutation = useUpdateGoal();
	const deleteMutation = useDeleteGoal();

	// Converter erro do React Query para formato compatível
	const error = queryError?.message || null;

	const createGoal = async (data: GoalFormData) => {
		try {
			// Converter GoalFormData para o formato esperado pela mutation
			const goalData = {
				title: data.title,
				description: data.description,
				targetDate: data.targetDate,
				priority: data.priority,
				tags: data.tags,
				status: "IN_PROGRESS" as const,
				userId: "", // Será preenchido pelo servidor
				category: "PERSONAL" as const, // Valor padrão
			};

			await createMutation.mutateAsync(goalData);
			toast.success("Meta criada com sucesso!");
		} catch (err) {
			toast.error("Erro ao criar meta");
			throw err;
		}
	};

	const updateGoal = async (id: string, data: Partial<Goal>) => {
		try {
			await updateMutation.mutateAsync({ id, data });

			// Invalidação adicional para garantir que task-counts seja atualizado
			// especialmente importante quando mudamos o status de IN_PROGRESS para CANCELLED
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });

			toast.success("Meta atualizada com sucesso!");
		} catch (err) {
			toast.error("Erro ao atualizar meta");
			throw err;
		}
	};

	const deleteGoal = async (id: string) => {
		try {
			await deleteMutation.mutateAsync(id);

			// Invalidação adicional para garantir que task-counts seja atualizado
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });

			toast.success("Meta excluída com sucesso!");
		} catch (err) {
			toast.error("Erro ao excluir meta");
			throw err;
		}
	};

	const refreshGoals = async () => {
		queryClient.invalidateQueries({ queryKey: ["goals"] });
	};

	const value: GoalContextType = {
		goals,
		loading,
		error,
		createGoal,
		updateGoal,
		deleteGoal,
		refreshGoals,
	};

	return (
		<GoalContext.Provider value={value}>
			{children}
		</GoalContext.Provider>
	);
}

export function useGoals(): GoalContextType {
	const context = useContext(GoalContext);
	if (context === undefined) {
		throw new Error("useGoals deve ser usado dentro de um GoalProvider");
	}
	return context;
}
