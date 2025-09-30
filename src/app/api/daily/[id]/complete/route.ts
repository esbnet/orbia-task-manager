import { NextRequest, NextResponse } from "next/server";

import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

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
        const dailyId = id;

        // Verificar se o daily existe e pertence ao usuário
        const daily = await prisma.daily.findFirst({
            where: {
                id: dailyId,
                userId: session.user.id,
            },
        });

        if (!daily) {
            return NextResponse.json(
                { error: "Daily não encontrado" },
                { status: 404 }
            );
        }

        // Criar log de conclusão
        const completedAt = new Date();
        const dailyLog = await prisma.dailyLog.create({
            data: {
                dailyId: dailyId,
                dailyTitle: daily.title,
                difficulty: daily.difficulty,
                tags: daily.tags,
                completedAt: completedAt,
            },
        });

        // Buscar todos os períodos da daily para debug
        const allPeriods = await prisma.dailyPeriod.findMany({
            where: {
                dailyId: dailyId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Marcar período atual como concluído
        const currentPeriod = await prisma.dailyPeriod.findFirst({
            where: {
                dailyId: dailyId,
                isActive: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (currentPeriod) {
            await prisma.dailyPeriod.update({
                where: { id: currentPeriod.id },
                data: {
                    isCompleted: true,
                    isActive: false,
                },
            });
        }

        // Criar novo período para o próximo ciclo
        const nextPeriodStart = DailyPeriodCalculator.calculateNextStartDate(daily.repeatType as "Diariamente" | "Semanalmente" | "Mensalmente" | "Anualmente", completedAt, daily.repeatFrequency);
        const nextPeriodEnd = DailyPeriodCalculator.calculatePeriodEnd(daily.repeatType as "Diariamente" | "Semanalmente" | "Mensalmente" | "Anualmente", nextPeriodStart, daily.repeatFrequency);

        const newPeriod = await prisma.dailyPeriod.create({
            data: {
                dailyId: dailyId,
                periodType: daily.repeatType,
                startDate: nextPeriodStart,
                endDate: nextPeriodEnd,
                isCompleted: false,
                isActive: true,
            },
        });

        // Atualizar lastCompletedDate do daily
        await prisma.daily.update({
            where: { id: dailyId },
            data: {
                lastCompletedDate: completedAt.toISOString(),
            },
        });

        // Buscar o daily atualizado
        const updatedDaily = await prisma.daily.findUnique({
            where: { id: dailyId },
            include: {
                logs: {
                    orderBy: {
                        completedAt: 'desc'
                    },
                    take: 1
                },
                subtasks: true
            }
        });

        return NextResponse.json({
            daily: updatedDaily,
            log: dailyLog,
            success: true
        });

    } catch (error) {
        console.error("Erro ao completar daily:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}