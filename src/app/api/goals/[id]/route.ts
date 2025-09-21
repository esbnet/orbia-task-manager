import { auth } from "@/auth";
import type { Goal } from "@/domain/entities/goal";
import { PrismaGoalRepository } from "@/infra/database/prisma/prisma-goal-repository";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const goalRepository = new PrismaGoalRepository();

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

		// Criar objeto Goal completo para o update
		const goalData: Goal = {
			...goal,
			...body,
			updatedAt: new Date(),
		};

		const updatedGoal = await goalRepository.update(goalData);

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
			const { id } = await params;	try {
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

		await goalRepository.delete(id);

		return NextResponse.json({ message: "Meta excluída com sucesso" });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}
