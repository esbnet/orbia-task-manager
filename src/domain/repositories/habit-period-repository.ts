import type { HabitPeriod, CreateHabitPeriodData, UpdateHabitPeriodData } from "../entities/habit-period";

export interface HabitPeriodRepository {
	// Buscar período ativo de um hábito
	findActiveByHabitId(habitId: string): Promise<HabitPeriod | null>;
	
	// Buscar todos os períodos de um hábito (histórico)
	findByHabitId(habitId: string): Promise<HabitPeriod[]>;
	
	// Buscar período por ID
	findById(id: string): Promise<HabitPeriod | null>;
	
	// Criar novo período
	create(data: CreateHabitPeriodData): Promise<HabitPeriod>;
	
	// Atualizar período
	update(id: string, data: UpdateHabitPeriodData): Promise<HabitPeriod>;
	
	// Finalizar período (marcar como inativo e definir endDate)
	finalizePeriod(id: string): Promise<HabitPeriod>;
	
	// Incrementar contador do período
	incrementCount(id: string): Promise<HabitPeriod>;
	
	// Buscar períodos que precisam ser finalizados (baseado no reset)
	findPeriodsToFinalize(): Promise<HabitPeriod[]>;
}
