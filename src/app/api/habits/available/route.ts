import { GetAvailableHabitsUseCase } from "@/application/use-cases/habit/get-available-habits/get-available-habits-use-case";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";

export async function GET() {
  try {
    const userId = await getCurrentUserIdWithFallback();

    if (!userId) {
      return Response.json({
        availableHabits: [],
        completedInCurrentPeriod: [],
        totalHabits: 0,
      });
    }

    const habitRepository = new PrismaHabitRepository();
    const habitPeriodRepository = new PrismaHabitPeriodRepository();
    
    const getAvailableHabitsUseCase = new GetAvailableHabitsUseCase(
      habitRepository,
      habitPeriodRepository
    );

    const result = await getAvailableHabitsUseCase.execute({ userId });

    return Response.json({
      ...result,
      "disponíveis": result.availableHabits.length,
      "completados": result.completedInCurrentPeriod.length,
      total: result.totalHabits,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}