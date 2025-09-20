import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { DailyApplicationService } from "@/application/services/daily-application-service";

// Instâncias únicas
const dailyRepository = new PrismaDailyRepository();
const dailyLogRepository = new PrismaDailyLogRepository();
const dailyPeriodRepository = new PrismaDailyPeriodRepository();
const dailyApplicationService = new DailyApplicationService(dailyRepository, dailyLogRepository, dailyPeriodRepository);

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
		}


		const result = await dailyApplicationService.completeDaily(id);
		console.log('Daily completada:', { id, result });

		return NextResponse.json({
			success: true,
			message: `Daily completada com sucesso!`,
			daily: result.daily,
			nextAvailableAt: result.nextAvailableAt,
		}, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
