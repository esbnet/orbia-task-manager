import { RegisterHabitWithLogUseCase } from "@/application/use-cases/habit/register-habit-with-log/register-habit-with-log-use-case";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitLogRepository } from "@/infra/database/prisma/prisma-habit-log-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";
import { z } from "zod";

const habitRepository = new PrismaHabitRepository();
const habitPeriodRepository = new PrismaHabitPeriodRepository();
const habitEntryRepository = new PrismaHabitEntryRepository();
const habitLogRepository = new PrismaHabitLogRepository();

const registerSchema = z.object({
	habitId: z.string().min(1),
	note: z.string().optional(),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = registerSchema.parse(body);

		const useCase = new RegisterHabitWithLogUseCase(
			habitRepository,
			habitPeriodRepository,
			habitEntryRepository,
			habitLogRepository,
		);

		const result = await useCase.execute(validated);
		return Response.json(result, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		if (error instanceof Error) {
			return Response.json({ error: error.message }, { status: 400 });
		}
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
