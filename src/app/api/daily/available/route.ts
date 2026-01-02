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
            const hasLogToday = await dailyLogRepository.hasLogForDate(daily.id, today);
            
            if (hasLogToday) {
                const nextAvailableAt = DailyPeriodCalculator.calculateNextStartDate(
                    daily.repeat.type as any,
                    new Date(),
                    daily.repeat.frequency
                );
                completedToday.push({ ...daily, nextAvailableAt });
            } else {
                availableDailies.push(daily);
            }
        }

        return NextResponse.json({
            availableDailies,
            completedToday,
            totalDailies: allDailies.length,
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