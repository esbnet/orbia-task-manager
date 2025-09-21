

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
			});
		}

		const getAvailableDailiesUseCase = UseCaseFactory.createGetAvailableDailiesUseCase();

		const result = await getAvailableDailiesUseCase.execute({ userId });

		return Response.json({
			...result,
			"disponíveis": result.availableDailies.length,
			"completadas": result.completedToday.length,
			total: result.totalDailies,
		});
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}


