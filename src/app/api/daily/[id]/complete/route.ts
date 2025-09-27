import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

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