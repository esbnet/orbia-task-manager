import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { DailyService } from "@/services/daily-service";

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

		const dailyRepository = new PrismaDailyRepository();
		const dailyLogRepository = new PrismaDailyLogRepository();
		const dailyPeriodRepository = new PrismaDailyPeriodRepository();
		const dailyService = new DailyService(dailyRepository, dailyLogRepository, dailyPeriodRepository);

		const result = await dailyService.completeDaily(id);

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
