import { GetHabitsAnalyticsUseCase } from "@/application/use-cases/habit/get-habits-analytics-use-case/get-habits-analytics-use-case";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();
const habitPeriodRepository = new PrismaHabitPeriodRepository();
const habitEntryRepository = new PrismaHabitEntryRepository();

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const timeRange = url.searchParams.get("timeRange") || "month";
		
		// Validate and sanitize timeRange
		const sanitizedTimeRange = InputSanitizer.sanitizeForLog(timeRange);
		const validatedTimeRange = InputSanitizer.sanitizeTimeRange(sanitizedTimeRange);

		const useCase = new GetHabitsAnalyticsUseCase(
			habitRepository,
			habitPeriodRepository,
			habitEntryRepository
		);

		const result = await useCase.execute({ timeRange: validatedTimeRange });

		return Response.json(result);
	} catch (error) {
		const safeError = InputSanitizer.sanitizeForLog(
			error instanceof Error ? error.message : "Unknown error"
		);
		return Response.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}