import { UseCaseFactory } from "@/infra/di/use-case-factory";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";

export async function GET() {
	try {
		const userId = await getCurrentUserIdWithFallback();

		if (!userId) {
			return Response.json({
				availableDailies: [],
				completedToday: [],
				totalDailies: 0,
				success: true,
			});
		}

		const reactivateDailyPeriodsUseCase = UseCaseFactory.createReactivateDailyPeriodsUseCase();
		const getAvailableDailiesUseCase = UseCaseFactory.createGetAvailableDailiesUseCase();

		await reactivateDailyPeriodsUseCase.execute({ userId });
		const result = await getAvailableDailiesUseCase.execute({ userId });

		return Response.json({
			...result,
			success: true,
		});
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}
