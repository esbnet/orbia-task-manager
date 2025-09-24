import type { HabitEntry, CreateHabitEntryData, HabitEntryWithPeriod } from "../entities/habit-entry";

export interface HabitEntryRepository {
	// Criar nova entrada (registro)
	create(data: CreateHabitEntryData): Promise<HabitEntry>;
	
	// Buscar entradas de um período
	findByPeriodId(periodId: string): Promise<HabitEntry[]>;
	
	// Buscar entradas de um hábito (simples)
	findByHabitId(habitId: string): Promise<HabitEntry[]>;
	
	// Buscar entradas de um hábito com informações do período
	findByHabitIdWithPeriod(habitId: string): Promise<HabitEntryWithPeriod[]>;
	
	// Buscar entradas de um hábito em um período específico
	findByHabitIdAndPeriod(habitId: string, periodId: string): Promise<HabitEntry[]>;
	
	// Buscar entradas de hoje de um hábito
	findTodayByHabitId(habitId: string): Promise<HabitEntry[]>;
	
	// Contar entradas de um período
	countByPeriodId(periodId: string): Promise<number>;
	
	// Deletar entrada
	delete(id: string): Promise<void>;
}
