import { PrismaHabitLogRepository } from "@/infra/database/prisma/prisma-habit-log-repository";
import { HabitModule } from "@/modules/habit";
import type { NextRequest } from "next/server";
import { z } from "zod";

const habitLogRepository = new PrismaHabitLogRepository();

const completeHabitSchema = z.object({
	habitId: z.string().min(1),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = completeHabitSchema.parse(body);

		const result = await HabitModule.toggle(validated.habitId);
		return Response.json({ success: true, updatedHabit: result }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const habitId = url.searchParams.get("habitId");

	if (habitId) {
		const logs = await habitLogRepository.findByEntityId(habitId);
		return Response.json({ habitLogs: logs });
	}

	const logs = await habitLogRepository.list();
	return Response.json({ habitLogs: logs });
}
