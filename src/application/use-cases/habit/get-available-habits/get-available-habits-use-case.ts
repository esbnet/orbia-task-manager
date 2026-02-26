import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { Habit } from "@/domain/entities/habit";

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

    return {
      availableHabits: activeHabits,
      completedInCurrentPeriod: [],
      totalHabits: activeHabits.length,
    };
  }
}
