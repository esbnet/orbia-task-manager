import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const dailyRepository = new PrismaDailyRepository();
        const dailyLogRepository = new PrismaDailyLogRepository();
        const allDailies = await dailyRepository.findByUserId(session.user.id);

        const today = new Date().toISOString().split('T')[0];
        const availableDailies = [];
        const completedToday = [];

        for (const daily of allDailies) {
            // Ignorar arquivadas
            if ((daily as any).status === "archived") {
                continue;
            }

            const lastLogDate = daily.lastCompletedDate
                ? new Date(daily.lastCompletedDate)
                : await dailyLogRepository.getLastLogDate(daily.id);

            const hasCompletion = !!lastLogDate;
            const isCompletedToday = hasCompletion && lastLogDate!.toISOString().split('T')[0] === today;

            // Nunca esconder diária nova ou não concluída
            if (!hasCompletion) {
                availableDailies.push({ ...daily, isOverdue: false });
                continue;
            }

            if (isCompletedToday) {
                const nextAvailableAt = DailyPeriodCalculator.calculateNextStartDate(
                    daily.repeat.type as any,
                    lastLogDate!,
                    daily.repeat.frequency
                );
                completedToday.push({ ...daily, nextAvailableAt, isAvailable: false });
                continue;
            }

            const nextAvailableAt = DailyPeriodCalculator.calculateNextStartDate(
                daily.repeat.type as any,
                lastLogDate!,
                daily.repeat.frequency
            );
            const now = new Date();

            // Se já passou do próximo período, está disponível de novo
            if (now >= nextAvailableAt) {
                availableDailies.push({ ...daily, isOverdue: false });
            } else {
                // Ainda dentro do período atual após conclusão de hoje
                completedToday.push({ ...daily, nextAvailableAt, isAvailable: false });
            }
        }

        return NextResponse.json({
            availableDailies,
            completedToday,
            totalDailies: allDailies.length,
            success: true,
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
