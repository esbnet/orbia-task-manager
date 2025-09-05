import { auth } from "@/auth";
import { PrismaGoalRepository } from "@/infra/database/prisma/prisma-goal-repository";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const goalRepository = new PrismaGoalRepository();

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; taskId: string }> }
) {
	const { id, taskId } = await params;

	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 401 },
			);
		}

		const goal = await goalRepository.findById(id);
		if (!goal) {
			return NextResponse.json(
				{ error: "Meta não encontrada" },
				{ status: 404 },
			);
		}

		if (goal.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 403 },
			);
		}

		const url = new URL(request.url);
		const taskType = url.searchParams.get("taskType");

		if (!taskType || !["habit", "daily", "todo"].includes(taskType)) {
			return NextResponse.json(
				{ error: "taskType é obrigatório e deve ser habit, daily ou todo" },
				{ status: 400 },
			);
		}

		await goalRepository.detachTask(id, taskId, taskType as "habit" | "daily" | "todo");

		return NextResponse.json({ message: "Tarefa removida com sucesso" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}