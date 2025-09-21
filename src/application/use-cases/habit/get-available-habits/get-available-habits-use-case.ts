import type { HabitRepository, HabitPeriodRepository } from "@/domain/repositories/all-repository";
import type { Habit } from "@/domain/entities/habit";
import type { HabitPeriod } from "@/domain/entities/habit-period";

export interface GetAvailableHabitsInput {
  userId: string;
}

export interface GetAvailableHabitsOutput {
  availableHabits: Habit[];
  completedInCurrentPeriod: Array<Habit & { nextAvailableAt: Date }>;
  totalHabits: number;
}

export class GetAvailableHabitsUseCase {
  constructor(
    private habitRepository: HabitRepository,
    private habitPeriodRepository: HabitPeriodRepository
  ) {}

  async execute(input: GetAvailableHabitsInput): Promise<GetAvailableHabitsOutput> {
    const { userId } = input;

    // Buscar todos os hábitos ativos do usuário
    const allHabits = await this.habitRepository.findByUserId(userId);
    const activeHabits = allHabits.filter(habit => habit.status === "Em Andamento");
    
    if (activeHabits.length === 0) {
      return {
        availableHabits: [],
        completedInCurrentPeriod: [],
        totalHabits: 0,
      };
    }

    const now = new Date();
    const availableHabits: Habit[] = [];
    const completedInCurrentPeriod: Array<Habit & { nextAvailableAt: Date }> = [];

    for (const habit of activeHabits) {
      // Buscar período ativo do hábito
      let activePeriod = await this.habitPeriodRepository.findActiveByHabitId(habit.id);
      
      if (!activePeriod) {
        // Criar novo período se não existe
        activePeriod = await this.habitPeriodRepository.create({
          habitId: habit.id,
          periodType: habit.reset,
          startDate: now,
        });
      }

      // Verificar se precisa resetar o período (zerar contador)
      const shouldReset = this.shouldResetPeriod(activePeriod, now);
      
      if (shouldReset) {
        // Finalizar período atual e criar novo
        await this.habitPeriodRepository.finalizePeriod(activePeriod.id);
        activePeriod = await this.habitPeriodRepository.create({
          habitId: habit.id,
          periodType: habit.reset,
          startDate: now,
        });
      }

      // Todos os hábitos ativos ficam sempre disponíveis
      availableHabits.push(habit);
    }

    return {
      availableHabits,
      completedInCurrentPeriod: [], // Sempre vazio, hábitos não se ocultam
      totalHabits: activeHabits.length,
    };
  }

  private shouldResetPeriod(period: HabitPeriod, now: Date): boolean {
    const startDate = new Date(period.startDate);
    
    switch (period.periodType) {
      case "Diariamente":
        // Reset se mudou de dia
        return now.toDateString() !== startDate.toDateString();
      
      case "Semanalmente":
        // Reset se passou 7 dias
        const weekDiff = now.getTime() - startDate.getTime();
        return weekDiff >= 7 * 24 * 60 * 60 * 1000;
      
      case "Mensalmente":
        // Reset se mudou de mês
        return now.getMonth() !== startDate.getMonth() || 
               now.getFullYear() !== startDate.getFullYear();
      
      default:
        return false;
    }
  }

  private calculateNextPeriodStart(period: HabitPeriod): Date {
    const startDate = new Date(period.startDate);
    const nextStart = new Date(startDate);

    switch (period.periodType) {
      case "Diariamente":
        nextStart.setDate(nextStart.getDate() + 1);
        nextStart.setHours(0, 0, 0, 0);
        break;
      
      case "Semanalmente":
        nextStart.setDate(nextStart.getDate() + 7);
        nextStart.setHours(0, 0, 0, 0);
        break;
      
      case "Mensalmente":
        nextStart.setMonth(nextStart.getMonth() + 1);
        nextStart.setDate(1);
        nextStart.setHours(0, 0, 0, 0);
        break;
      
      default:
        nextStart.setDate(nextStart.getDate() + 1);
        nextStart.setHours(0, 0, 0, 0);
    }

    return nextStart;
  }
}