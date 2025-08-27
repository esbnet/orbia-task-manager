import { RegisterHabitUseCase } from "@/application/use-cases/habit/register-habit-use-case/register-habit-use-case";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();
const habitPeriodRepository = new PrismaHabitPeriodRepository();
const habitEntryRepository = new PrismaHabitEntryRepository();

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const useCase = new RegisterHabitUseCase(
			habitRepository,
			habitPeriodRepository,
			habitEntryRepository
		);

		const result = await useCase.execute({
			habitId: id,
			note: body.note,
		});

		return Response.json(result, { status: 201 });
	} catch (error) {
		console.error("Error registering habit:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
