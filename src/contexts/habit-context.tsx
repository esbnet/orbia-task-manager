"use client";

import type { Habit } from "@/domain/entities/habit";
import type { HabitFormData } from "@/types/habit";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import { CreateHabitUseCase } from "@/application/use-cases/habit/create-habit/create-habit-use-case";
import { DeleteHabitUseCase } from "@/application/use-cases/habit/delete-habit-use-case/delete-habit-use-case";
import { ListHabitUseCase } from "@/application/use-cases/habit/list-habit-use-case/list-habit-use-case";
import { UpdateHabitUseCase } from "@/application/use-cases/habit/update-habit/update-habit-use-case";
import { ApiHabitRepository } from "@/infra/repositories/http/api-habit-repository";

interface HabitContextType {
	habits: Habit[];
	loading: boolean;
	error: string | null;
	createHabit: (data: HabitFormData) => Promise<void>;
	updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
	deleteHabit: (id: string) => Promise<void>;
	refreshHabits: () => Promise<void>;
	completeHabit: (habit: Habit) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

interface HabitProviderProps {
	children: ReactNode;
}

export function HabitProvider({ children }: HabitProviderProps) {
	const [habits, setHabits] = useState<Habit[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const habitRepository = new ApiHabitRepository();
	const createHabitUseCase = new CreateHabitUseCase(habitRepository);
	const updateHabitUseCase = new UpdateHabitUseCase(habitRepository);
	const deleteHabitUseCase = new DeleteHabitUseCase(habitRepository);
	const listHabitUseCase = new ListHabitUseCase(habitRepository);

	const fetchHabits = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await listHabitUseCase.execute();
			setHabits(result.habits);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao carregar hábitos");
		} finally {
			setLoading(false);
		}
	}, [listHabitUseCase]);

	const createHabit = async (data: HabitFormData) => {
		try {
			setError(null);

			const result = await createHabitUseCase.execute({
				title: data.title,
				observations: data.observations,
				difficulty: data.difficulty,
				priority: data.priority,
				category: data.category,
				tags: data.tags,
				reset: data.reset,
				createdAt: new Date(),
			});

			setHabits((prev) => [result.habit, ...prev]);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao criar hábito");
			throw err;
		}
	};

	const updateHabit = async (id: string, data: Partial<Habit>) => {
		try {
			setError(null);

			// Buscar o hábito atual
			const currentHabit = habits.find(h => h.id === id);
			if (!currentHabit) {
				throw new Error("Hábito não encontrado");
			}

			// Criar objeto completo para o use case
			const updatedHabit = { ...currentHabit, ...data, updatedAt: new Date() };

			const result = await updateHabitUseCase.execute(updatedHabit);

			setHabits((prev) =>
				prev.map((habit) => habit.id === id ? result : habit),
			);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erro ao atualizar hábito",
			);
			throw err;
		}
	};

	const deleteHabit = async (id: string) => {
		try {
			setError(null);

			await deleteHabitUseCase.execute({ id });
			setHabits((prev) => prev.filter((habit) => habit.id !== id));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erro ao excluir hábito",
			);
			throw err;
		}
	};

	const refreshHabits = async () => {
		await fetchHabits();
	};



	const completeHabit = async (habit: Habit) => {
		try {
			setLoading(true);
			setError(null);

			// Usar o método toggleComplete do repositório para marcar como completo
			const updatedHabit = await habitRepository.toggleComplete(habit.id);

			setHabits((prevHabits) =>
				prevHabits.map((h) =>
					h.id === habit.id ? updatedHabit : h,
				),
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao completar hábito");
			console.error("Erro ao completar hábito:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchHabits();
	}, [fetchHabits]);

	const value: HabitContextType = {
		habits,
		loading,
		error,
		createHabit,
		updateHabit,
		deleteHabit,
		refreshHabits,
		completeHabit,
	};

	return (
		<HabitContext.Provider value={value}>{children}</HabitContext.Provider>
	);
}

export function useHabits(): HabitContextType {
	const context = useContext(HabitContext);
	if (context === undefined) {
		throw new Error("useHabits deve ser usado dentro de um HabitProvider");
	}
	return context;
}
