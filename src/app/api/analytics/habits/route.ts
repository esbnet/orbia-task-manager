import { GetHabitsAnalyticsUseCase } from "@/application/use-cases/habit/get-habits-analytics-use-case/get-habits-analytics-use-case";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();
const habitPeriodRepository = new PrismaHabitPeriodRepository();
const habitEntryRepository = new PrismaHabitEntryRepository();

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const timeRange = url.searchParams.get("timeRange") || "month";

		const useCase = new GetHabitsAnalyticsUseCase(
			habitRepository,
			habitPeriodRepository,
			habitEntryRepository
		);

		const result = await useCase.execute({ timeRange: timeRange as "week" | "month" | "quarter" | "year" });

		return Response.json(result);
	} catch (error) {
		console.error("Erro ao buscar analytics de hábitos:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}