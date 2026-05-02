import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { HabitModule } from "@/modules/habit";

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

    const result = await HabitModule.available(userId);

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
