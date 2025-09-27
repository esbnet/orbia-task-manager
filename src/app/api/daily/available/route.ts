import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Buscar todas as dailies do usuário
    const allDailies = await prisma.daily.findMany({
      where: {
        userId: session.user.id,
        startDate: {
          lte: now
        }
      },
      include: {
        periods: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        logs: {
          where: {
            completedAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        },
        subtasks: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Separar dailies disponíveis e completadas
    const availableDailies = [];
    const completedToday = [];

    for (const daily of allDailies) {
      const activePeriod = daily.periods[0];

      // Se tem período ativo e não foi completado hoje, está disponível
      if (activePeriod && !activePeriod.isCompleted) {
        availableDailies.push(daily);
      }
      // Se foi completado hoje, adicionar à lista de completadas
      else if (daily.logs && daily.logs.length > 0) {
        completedToday.push(daily);
      }
      // Se não tem período ativo mas deveria ter (baseado na data de início e tipo de repetição)
      else if (shouldHaveActivePeriod(daily)) {
        // Criar período automaticamente
        const endDate = calculatePeriodEnd(daily.repeatType, now, daily.repeatFrequency);
        const newPeriod = await prisma.dailyPeriod.create({
          data: {
            dailyId: daily.id,
            periodType: daily.repeatType,
            startDate: now,
            endDate,
            isCompleted: false,
            isActive: true,
          }
        });

        // Adicionar à lista de disponíveis
        availableDailies.push({
          ...daily,
          periods: [newPeriod]
        });
      }
    }

    return NextResponse.json({
      availableDailies,
      completedToday,
      success: true
    });

  } catch (error) {
    console.error("Erro ao buscar dailies disponíveis:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Verifica se uma daily deveria ter um período ativo
function shouldHaveActivePeriod(daily: any): boolean {
  const now = new Date();
  const startDate = new Date(daily.startDate);

  // Se a data de início ainda não chegou, não deveria ter período ativo
  if (now < startDate) {
    return false;
  }

  // Se nunca foi completada, deveria ter um período ativo
  if (!daily.lastCompletedDate) {
    return true;
  }

  // Se já foi completada antes, verificar baseado no tipo de repetição
  const lastCompleted = new Date(daily.lastCompletedDate);
  const { repeatType, repeatFrequency } = daily;

  switch (repeatType) {
    case "Diariamente":
      const nextDay = new Date(lastCompleted);
      nextDay.setDate(lastCompleted.getDate() + repeatFrequency);
      return now >= nextDay;

    case "Semanalmente":
      const nextWeek = new Date(lastCompleted);
      nextWeek.setDate(lastCompleted.getDate() + (7 * repeatFrequency));
      return now >= nextWeek;

    case "Mensalmente":
      const nextMonth = new Date(lastCompleted);
      nextMonth.setMonth(lastCompleted.getMonth() + repeatFrequency);
      return now >= nextMonth;

    case "Anualmente":
      const nextYear = new Date(lastCompleted);
      nextYear.setFullYear(lastCompleted.getFullYear() + repeatFrequency);
      return now >= nextYear;

    default:
      return true;
  }
}

// Calcula a data de fim do período baseado no tipo de repetição
function calculatePeriodEnd(repeatType: string, startDate: Date, frequency: number): Date {
  const endDate = new Date(startDate);

  switch (repeatType) {
    case "Diariamente":
      endDate.setHours(23, 59, 59, 999);
      break;
    case "Semanalmente":
      endDate.setDate(endDate.getDate() + (7 * frequency - 1));
      endDate.setHours(23, 59, 59, 999);
      break;
    case "Mensalmente":
      endDate.setMonth(endDate.getMonth() + frequency);
      endDate.setDate(0); // Último dia do mês
      endDate.setHours(23, 59, 59, 999);
      break;
    case "Anualmente":
      endDate.setFullYear(endDate.getFullYear() + frequency);
      endDate.setMonth(11, 31); // 31 de dezembro
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      endDate.setHours(23, 59, 59, 999);
  }

  return endDate;
}