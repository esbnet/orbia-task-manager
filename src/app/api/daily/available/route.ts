import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GetAvailableDailiesUseCase } from "@/application/use-cases/daily/get-available-dailies/get-available-dailies-use-case";
import { ReactivateDailyPeriodsUseCase } from "@/application/use-cases/daily/reactivate-daily-periods/reactivate-daily-periods-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const dailyRepository = new PrismaDailyRepository();
        const dailyLogRepository = new PrismaDailyLogRepository();
        const dailyPeriodRepository = new PrismaDailyPeriodRepository();

        const reactivateUseCase = new ReactivateDailyPeriodsUseCase(
            dailyRepository,
            dailyPeriodRepository
        );

        await reactivateUseCase.execute({ userId: session.user.id });

        const getAvailableUseCase = new GetAvailableDailiesUseCase(
            dailyRepository,
            dailyLogRepository,
            dailyPeriodRepository
        );

        const result = await getAvailableUseCase.execute({ userId: session.user.id });

        return NextResponse.json({
            ...result,
            success: true,
        });

    } catch (error) {
        console.error("Erro ao buscar dailies disponíveis:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}