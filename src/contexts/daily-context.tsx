"use client";

import type { Daily } from "@/domain/entities/daily";
import type { DailyFormData } from "@/services/daily-service";
import React from "react";
import { createEntityContext } from "./base/entity-context-factory";

// Create HTTP-based service for client-side usage
const httpDailyService = {
	async list(): Promise<Daily[]> {
		const response = await fetch('/api/daily');
		if (!response.ok) {
			throw new Error('Failed to fetch dailies');
		}
		const data = await response.json();
		return data.daily || [];
	},

	async create(data: DailyFormData): Promise<Daily> {
		const response = await fetch('/api/daily', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error('Failed to create daily');
		}
		const result = await response.json();
		return result.daily;
	},

	async update(id: string, data: Partial<Daily>): Promise<Daily> {
		const response = await fetch(`/api/daily/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error('Failed to update daily');
		}
		const result = await response.json();
		return result.daily;
	},

	async delete(id: string): Promise<void> {
		const response = await fetch(`/api/daily/${id}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to delete daily');
		}
	},

	// Daily-specific HTTP methods
	async completeDaily(id: string): Promise<void> {
		const response = await fetch(`/api/daily/${id}/complete`, {
			method: 'PATCH',
		});
		if (!response.ok) {
			throw new Error('Failed to complete daily');
		}
	},

	async toggleComplete(id: string): Promise<void> {
		const response = await fetch(`/api/daily/${id}/toggle`, {
			method: 'PATCH',
		});
		if (!response.ok) {
			throw new Error('Failed to toggle daily');
		}
	},

	async reorderDailies(ids: string[]): Promise<void> {
		const response = await fetch('/api/dailies/reorder', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ ids }),
		});
		if (!response.ok) {
			throw new Error('Failed to reorder dailies');
		}
	},

	async addTask(dailyId: string, task: string): Promise<void> {
		const response = await fetch(`/api/dailies/${dailyId}/tasks`, {
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

	async removeTask(dailyId: string, taskIndex: number): Promise<void> {
		const response = await fetch(`/api/dailies/${dailyId}/tasks/${taskIndex}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to remove task');
		}
	},
};

// Create context using factory
const {
	Context: DailyContext,
	Provider: BaseDailyProvider,
	useContext: useBaseDailies,
} = createEntityContext<Daily, DailyFormData>({
	entityName: "Daily",
	service: httpDailyService,
	enableCache: true,
	cacheTimeout: 5 * 60 * 1000, // 5 minutes
});

// Extended context type with daily-specific methods
interface ExtendedDailyContextType {
	dailies: Daily[];
	loading: boolean;
	error: string | null;
	createDaily: (data: DailyFormData) => Promise<void>;
	updateDaily: (id: string, data: Partial<Daily>) => Promise<void>;
	deleteDaily: (id: string) => Promise<void>;
	refreshDailies: () => Promise<void>;
	// Daily-specific methods
	completeDaily: (dailyId: string) => Promise<void>;
	toggleComplete: (dailyId: string) => Promise<void>;
	getCompletedDailies: () => Daily[];
	getPendingDailies: () => Daily[];
	getDailiesForToday: () => Daily[];
	getDailiesByDifficulty: (difficulty: Daily["difficulty"]) => Daily[];
	getDailiesByRepeatType: (repeatType: Daily["repeat"]["type"]) => Daily[];
	reorderDailies: (dailyIds: string[]) => Promise<void>;
	addTask: (dailyId: string, task: string) => Promise<void>;
	removeTask: (dailyId: string, taskIndex: number) => Promise<void>;
}

// Enhanced provider with daily-specific functionality
export function DailyProvider({ children }: { children: React.ReactNode }) {
	return (
		<BaseDailyProvider>
			<DailyContextEnhancer>{children}</DailyContextEnhancer>
		</BaseDailyProvider>
	);
}

// Context enhancer component
function DailyContextEnhancer({ children }: { children: React.ReactNode }) {
	const baseContext = useBaseDailies();

	// Daily-specific methods
	const completeDaily = async (dailyId: string) => {
		await httpDailyService.completeDaily(dailyId);
		await baseContext.refresh();
	};

	const toggleComplete = async (dailyId: string) => {
		await httpDailyService.toggleComplete(dailyId);
		await baseContext.refresh();
	};

	const getCompletedDailies = () => {
		return baseContext.entities.filter((daily) => daily.lastCompletedDate);
	};

	const getPendingDailies = () => {
		return baseContext.entities.filter((daily) => !daily.lastCompletedDate);
	};

	const getDailiesForToday = () => {
		// This would use the service's findDueToday method
		// For now, we'll filter based on completion status and today's date
		const today = new Date().toISOString().split("T")[0];
		return baseContext.entities.filter((daily) => {
			// If already completed today, don't show
			if (daily.lastCompletedDate && daily.lastCompletedDate === today) {
				return false;
			}
			// Show if not completed or completed on a different day
			return true;
		});
	};

	const getDailiesByDifficulty = (difficulty: Daily["difficulty"]) => {
		return baseContext.entities.filter((daily) => daily.difficulty === difficulty);
	};

	const getDailiesByRepeatType = (repeatType: Daily["repeat"]["type"]) => {
		return baseContext.entities.filter((daily) => daily.repeat.type === repeatType);
	};

	const reorderDailies = async (dailyIds: string[]) => {
		await httpDailyService.reorderDailies(dailyIds);
		await baseContext.refresh();
	};

	const addTask = async (dailyId: string, task: string) => {
		await httpDailyService.addTask(dailyId, task);
		await baseContext.refresh();
	};

	const removeTask = async (dailyId: string, taskIndex: number) => {
		await httpDailyService.removeTask(dailyId, taskIndex);
		await baseContext.refresh();
	};

	// Enhanced context value
	const enhancedContext: ExtendedDailyContextType = {
		dailies: baseContext.entities,
		loading: baseContext.loading,
		error: baseContext.error,
		createDaily: baseContext.create,
		updateDaily: baseContext.update,
		deleteDaily: baseContext.delete,
		refreshDailies: baseContext.refresh,
		completeDaily,
		toggleComplete,
		getCompletedDailies,
		getPendingDailies,
		getDailiesForToday,
		getDailiesByDifficulty,
		getDailiesByRepeatType,
		reorderDailies,
		addTask,
		removeTask,
	};

	return (
		<EnhancedDailyContext.Provider value={enhancedContext}>
			{children}
		</EnhancedDailyContext.Provider>
	);
}

// Enhanced context
const EnhancedDailyContext = React.createContext<ExtendedDailyContextType | undefined>(undefined);

// Hook to use enhanced daily context
export function useDailies(): ExtendedDailyContextType {
	const context = React.useContext(EnhancedDailyContext);
	if (context === undefined) {
		throw new Error("useDailies deve ser usado dentro de um DailyProvider");
	}
	return context;
}

// Export for backward compatibility
export { useDailies as useDailyContext };
