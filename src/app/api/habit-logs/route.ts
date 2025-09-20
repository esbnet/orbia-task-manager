import { CompleteHabitUseCase } from "@/application/use-cases/habit/complete-habit/complete-habit-use-case";
import { PrismaHabitLogRepository } from "@/infra/database/prisma/prisma-habit-log-repository";
import type { NextRequest } from "next/server";

const habitLogRepository = new PrismaHabitLogRepository();
const completeHabitUseCase = new CompleteHabitUseCase(habitLogRepository);

export async function POST(request: NextRequest) {
	const { habit } = await request.json();
	const result = await completeHabitUseCase.execute({ habit });
	return Response.json(result, { status: 201 });
}

export async function GET() {
	const logs = await habitLogRepository.list();
	return Response.json({ habitLogs: logs });
}
