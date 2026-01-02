import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { CompleteDailyUseCase } from "@/application/use-cases/daily/complete-daily-simple/complete-daily-simple-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";

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

        const useCase = new CompleteDailyUseCase(
            new PrismaDailyRepository(),
            new PrismaDailyLogRepository()
        );

        const result = await useCase.execute({ 
            dailyId: id, 
            userId: session.user.id 
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Erro ao completar daily:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erro interno" },
            { status: 500 }
        );
    }
}