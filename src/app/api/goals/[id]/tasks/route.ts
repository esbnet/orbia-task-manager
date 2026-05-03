import { auth } from "@/auth";
import { GoalModule } from "@/modules/goal";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

		const goal = await GoalModule.findById(id);
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

		const attachedTasks = await GoalModule.getAttachedTasks(id);

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

		const goal = await GoalModule.findById(id);
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

		if (!taskType || !taskId) {
			return NextResponse.json(
				{ error: "taskId e taskType são obrigatórios" },
				{ status: 400 },
			);
		}

		if (!["habit", "todo"].includes(taskType)) {
			return NextResponse.json(
				{ error: "taskType deve ser habit ou todo" },
				{ status: 400 },
			);
		}

		await GoalModule.attachTask(id, taskId, taskType as "habit" | "todo");

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

		const goal = await GoalModule.findById(id);
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
			["habit", "todo"].includes(task.taskType)
		);

		await GoalModule.updateAttachedTasks(id, validatedTasks);

		return NextResponse.json({ message: "Tarefas atualizadas com sucesso" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}