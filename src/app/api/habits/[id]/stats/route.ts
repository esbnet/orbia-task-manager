import { GetHabitStatsUseCase } from "@/application/use-cases/habit/get-habit-stats-use-case/get-habit-stats-use-case";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();
const habitPeriodRepository = new PrismaHabitPeriodRepository();
const habitEntryRepository = new PrismaHabitEntryRepository();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const useCase = new GetHabitStatsUseCase(
			habitRepository,
			habitPeriodRepository,
			habitEntryRepository
		);

		const result = await useCase.execute({ habitId: id });

		return Response.json(result);
	} catch (error) {
		console.error("Error getting habit stats:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
