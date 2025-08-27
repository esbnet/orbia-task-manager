"use client";

import type { Habit } from "@/domain/entities/habit";
import type { HabitFormData } from "@/services/habit-service";
import React from "react";
import { toast } from "sonner";
import { createEntityContext } from "./base/entity-context-factory";

// Create HTTP-based service for client-side usage
const httpHabitService = {
	async list(): Promise<Habit[]> {
		const response = await fetch('/api/habits');
		if (!response.ok) {
			throw new Error('Failed to fetch habits');
		}
		const data = await response.json();
		return data.habits;
	},

	async create(data: HabitFormData): Promise<Habit> {
		const response = await fetch('/api/habits', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error('Failed to create habit');
		}
		const result = await response.json();
		return result.habit;
	},

	async update(id: string, data: Partial<Habit>): Promise<Habit> {
		const response = await fetch('/api/habits', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ habit: { id, ...data } }),
		});
		if (!response.ok) {
			throw new Error('Failed to update habit');
		}
		const result = await response.json();
		return result.habit;
	},

	async delete(id: string): Promise<void> {
		const response = await fetch(`/api/habits/${id}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to delete habit');
		}
	},
};

// Create context using factory
const {
	Context: HabitContext,
	Provider: BaseHabitProvider,
	useContext: useBaseHabits,
} = createEntityContext<Habit, HabitFormData>({
	entityName: "Habit",
	service: httpHabitService,
	enableCache: true,
	cacheTimeout: 5 * 60 * 1000, // 5 minutes
});

// Extended context type with habit-specific methods
interface ExtendedHabitContextType {
	habits: Habit[];
	loading: boolean;
	error: string | null;
	createHabit: (data: HabitFormData) => Promise<void>;
	updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
	deleteHabit: (id: string) => Promise<void>;
	refreshHabits: () => Promise<void>;
	// Habit-specific methods
	completeHabit: (habitId: string) => Promise<void>;
	toggleComplete: (habitId: string) => Promise<void>;
	updateStatus: (id: string, status: Habit["status"]) => Promise<void>;
	updatePriority: (id: string, priority: Habit["priority"]) => Promise<void>;
	updateCategory: (id: string, category: Habit["category"]) => Promise<void>;
	getHabitsByStatus: (status: Habit["status"]) => Habit[];
	getHabitsByPriority: (priority: Habit["priority"]) => Habit[];
	getHabitsByCategory: (category: Habit["category"]) => Habit[];
	reorderHabits: (habitIds: string[]) => Promise<void>;
}

// Enhanced provider with habit-specific functionality
export function HabitProvider({ children }: { children: React.ReactNode }) {
	return (
		<BaseHabitProvider>
			<HabitContextEnhancer>{children}</HabitContextEnhancer>
		</BaseHabitProvider>
	);
}

// Context enhancer component
function HabitContextEnhancer({ children }: { children: React.ReactNode }) {
	const baseContext = useBaseHabits();

	// Habit-specific methods
	const completeHabit = async (habitId: string) => {
		try {
			const response = await fetch(`/api/habits/${habitId}/complete`, {
				method: 'PATCH',
			});
			if (!response.ok) {
				throw new Error('Failed to complete habit');
			}
			await baseContext.refresh();

			const habit = baseContext.entities.find(h => h.id === habitId);
			toast.success(`Hábito "${habit?.title || 'Hábito'}" concluído!`);
		} catch (error) {
			toast.error('Erro ao concluir hábito. Tente novamente.');
			throw error;
		}
	};

	const toggleComplete = async (habitId: string) => {
		const habit = baseContext.entities.find(h => h.id === habitId);
		if (habit) {
			try {
				const isCompleted = habit.lastCompletedDate === new Date().toISOString().split("T")[0];
				const endpoint = `/api/habits/${habitId}/complete`;
				const method = isCompleted ? 'DELETE' : 'PATCH';

				const response = await fetch(endpoint, { method });
				if (!response.ok) {
					throw new Error('Failed to toggle habit completion');
				}
				await baseContext.refresh();

				const actionText = isCompleted ? 'desmarcado' : 'concluído';
				toast.success(`Hábito "${habit.title}" ${actionText}!`);
			} catch (error) {
				toast.error('Erro ao alterar status do hábito. Tente novamente.');
				throw error;
			}
		}
	};

	const updateStatus = async (id: string, status: Habit["status"]) => {
		await httpHabitService.update(id, { status });
		await baseContext.refresh();
	};

	const updatePriority = async (id: string, priority: Habit["priority"]) => {
		await httpHabitService.update(id, { priority });
		await baseContext.refresh();
	};

	const updateCategory = async (id: string, category: Habit["category"]) => {
		await httpHabitService.update(id, { category });
		await baseContext.refresh();
	};

	const getHabitsByStatus = (status: Habit["status"]) => {
		return baseContext.entities.filter((habit) => habit.status === status);
	};

	const getHabitsByPriority = (priority: Habit["priority"]) => {
		return baseContext.entities.filter((habit) => habit.priority === priority);
	};

	const getHabitsByCategory = (category: Habit["category"]) => {
		return baseContext.entities.filter((habit) => habit.category === category);
	};

	const reorderHabits = async (habitIds: string[]) => {
		try {
			const response = await fetch('/api/habits/reorder', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ids: habitIds }),
			});
			if (!response.ok) {
				throw new Error('Failed to reorder habits');
			}
			await baseContext.refresh();
			toast.success('Hábitos reordenados com sucesso!');
		} catch (error) {
			toast.error('Erro ao reordenar hábitos. Tente novamente.');
			throw error;
		}
	};

	// Enhanced context value
	const enhancedContext: ExtendedHabitContextType = {
		habits: baseContext.entities,
		loading: baseContext.loading,
		error: baseContext.error,
		createHabit: baseContext.create,
		updateHabit: baseContext.update,
		deleteHabit: baseContext.delete,
		refreshHabits: baseContext.refresh,
		completeHabit,
		toggleComplete,
		updateStatus,
		updatePriority,
		updateCategory,
		getHabitsByStatus,
		getHabitsByPriority,
		getHabitsByCategory,
		reorderHabits,
	};

	return (
		<EnhancedHabitContext.Provider value={enhancedContext}>
			{children}
		</EnhancedHabitContext.Provider>
	);
}

// Enhanced context
const EnhancedHabitContext = React.createContext<ExtendedHabitContextType | undefined>(undefined);

// Hook to use enhanced habit context
export function useHabits(): ExtendedHabitContextType {
	const context = React.useContext(EnhancedHabitContext);
	if (context === undefined) {
		throw new Error("useHabits deve ser usado dentro de um HabitProvider");
	}
	return context;
}

// Export for backward compatibility
export { useHabits as useHabitContext };
