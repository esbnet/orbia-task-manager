import { CompleteHabitUseCase } from "@/application/use-cases/habit/complete-habit/complete-habit-use-case";
import { PrismaHabitLogRepository } from "@/infra/database/prisma/prisma-habit-log-repository";
import { z } from "zod";
import type { NextRequest } from "next/server";

const habitLogRepository = new PrismaHabitLogRepository();
const completeHabitUseCase = new CompleteHabitUseCase(habitLogRepository);

const completeHabitSchema = z.object({
	habit: z.object({
		id: z.string().min(1),
	}).passthrough(),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = completeHabitSchema.parse(body);
		
		const sanitizedHabit = {
			...validated.habit,
			id: String(validated.habit.id),
		} as any;
		
		const result = await completeHabitUseCase.execute({ habit: sanitizedHabit });
		return Response.json(result, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function GET() {
	const logs = await habitLogRepository.list();
	return Response.json({ habitLogs: logs });
}
