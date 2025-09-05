import { auth } from "@/auth";
import { PrismaGoalRepository } from "@/infra/database/prisma/prisma-goal-repository";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const goalRepository = new PrismaGoalRepository();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

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

		const attachedTasks = await goalRepository.getAttachedTasks(id);

		return NextResponse.json(attachedTasks);
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

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

		const body = await request.json();
		const { taskId, taskType } = body;

		if (!taskId || !taskType) {
			return NextResponse.json(
				{ error: "taskId e taskType são obrigatórios" },
				{ status: 400 },
			);
		}

		if (!["habit", "daily", "todo"].includes(taskType)) {
			return NextResponse.json(
				{ error: "taskType deve ser habit, daily ou todo" },
				{ status: 400 },
			);
		}

		await goalRepository.attachTask(id, taskId, taskType as "habit" | "daily" | "todo");

		return NextResponse.json({ message: "Tarefa anexada com sucesso" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

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

		const body = await request.json();
		const { tasks } = body;

		if (!Array.isArray(tasks)) {
			return NextResponse.json(
				{ error: "tasks deve ser um array" },
				{ status: 400 },
			);
		}

		const validatedTasks = tasks.filter(task =>
			task &&
			typeof task.taskId === "string" &&
			typeof task.taskType === "string" &&
			["habit", "daily", "todo"].includes(task.taskType)
		);

		await goalRepository.updateAttachedTasks(id, validatedTasks);

		return NextResponse.json({ message: "Tarefas atualizadas com sucesso" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}