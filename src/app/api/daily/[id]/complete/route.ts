import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/di/container";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getCurrentUserIdWithFallback();
        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const result = await container.getDailyApplicationService().completeDaily(id);

        return NextResponse.json({
            success: true,
            message: "Daily completada com sucesso!",
            daily: result.daily,
            nextAvailableAt: result.nextAvailableAt,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erro interno" },
            { status: 500 }
        );
    }
}
