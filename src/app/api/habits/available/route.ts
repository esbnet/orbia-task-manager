import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { UseCaseFactory } from "@/infra/di/use-case-factory";

// Força a rota a ser dinâmica devido ao uso de headers na autenticação
export const dynamic = 'force-dynamic'

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

    const getAvailableHabitsUseCase = UseCaseFactory.createGetAvailableHabitsUseCase();

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
