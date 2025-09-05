"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { Goal } from "@/domain/entities/goal";
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
	const [goals, setGoals] = useState<Goal[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchGoals = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch("/api/goals");

			if (!response.ok) {
				throw new Error("Erro ao carregar metas");
			}

			const goals = await response.json();
			setGoals(goals);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erro ao carregar metas",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	const createGoal = async (data: GoalFormData) => {
		try {
			setError(null);

			const response = await fetch("/api/goals", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					attachedTasks: data.attachedTasks || [],
				}),
			});

			if (!response.ok) {
				throw new Error("Erro ao criar meta");
			}

			const newGoal = await response.json();
			setGoals((prev) => [newGoal, ...prev]);
			toast.success("Meta criada com sucesso!");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao criar meta");
			toast.error("Erro ao criar meta");
			throw err;
		}
	};

	const updateGoal = async (id: string, data: Partial<Goal>) => {
		try {
			setError(null);

			const response = await fetch(`/api/goals/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Erro ao atualizar meta");
			}

			const updatedGoal = await response.json();
			setGoals((prev) =>
				prev.map((goal) => (goal.id === id ? updatedGoal : goal)),
			);
			toast.success("Meta atualizada com sucesso!");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erro ao atualizar meta",
			);
			toast.error("Erro ao atualizar meta");
			throw err;
		}
	};

	const deleteGoal = async (id: string) => {
		try {
			setError(null);

			const response = await fetch(`/api/goals/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erro ao excluir meta");
			}

			setGoals((prev) => prev.filter((goal) => goal.id !== id));
			toast.success("Meta excluída com sucesso!");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erro ao excluir meta",
			);
			toast.error("Erro ao excluir meta");
			throw err;
		}
	};

	const refreshGoals = async () => {
		await fetchGoals();
	};

	useEffect(() => {
		fetchGoals();
	}, [fetchGoals]);

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
