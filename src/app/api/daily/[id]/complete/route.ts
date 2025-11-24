import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { CompleteDailyWithLogUseCase } from "@/application/use-cases/daily/complete-daily-with-log/complete-daily-with-log-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const dailyRepository = new PrismaDailyRepository();
        
        const daily = await dailyRepository.findById(id);

        if (!daily || daily.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Daily não encontrado" },
                { status: 404 }
            );
        }

        const completeDailyUseCase = new CompleteDailyWithLogUseCase(
            dailyRepository,
            new PrismaDailyLogRepository(),
            new PrismaDailyPeriodRepository()
        );

        const result = await completeDailyUseCase.execute({ daily });

        return NextResponse.json({
            daily: result.updatedDaily,
            success: result.success
        });

    } catch (error) {
        console.error("Erro ao completar daily:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}