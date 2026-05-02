import { auth } from "@/auth";
import { GoalModule } from "@/modules/goal";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	_request: NextRequest,
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

		return NextResponse.json(goal);
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
		const updatedGoal = await GoalModule.update({ id, ...body });

		return NextResponse.json(updatedGoal);
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: NextRequest,
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

		await GoalModule.delete(id);

		return NextResponse.json({ message: "Meta excluída com sucesso" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}
