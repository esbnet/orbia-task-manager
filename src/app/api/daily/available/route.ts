import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Buscar dailies disponíveis (não completados hoje)
    const availableDailies = await prisma.daily.findMany({
      where: {
        userId: session.user.id,
        startDate: {
          lte: now
        }
      },
      include: {
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

    // Filtrar apenas os que não foram completados hoje
    const notCompletedToday = availableDailies.filter(daily =>
      !daily.logs || daily.logs.length === 0
    );

    // Buscar dailies completados hoje
    const completedToday = await prisma.daily.findMany({
      where: {
        userId: session.user.id,
        logs: {
          some: {
            completedAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
      },
      include: {
        logs: {
          where: {
            completedAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 1
        },
        subtasks: true
      },
      orderBy: {
        logs: {
          _count: 'desc'
        }
      }
    });

    return NextResponse.json({
      availableDailies: notCompletedToday,
      completedToday: completedToday,
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