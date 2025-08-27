import { PrismaTodoLogRepository } from "@/infra/database/prisma/prisma-todo-log-repository";
import type { NextRequest } from "next/server";

const todoLogRepository = new PrismaTodoLogRepository();

export async function POST(request: NextRequest) {
	const { todoId, todoTitle, difficulty, tags, completedAt } =
		await request.json();
	const log = await todoLogRepository.create({
		todoId,
		todoTitle,
		difficulty,
		tags,
		completedAt: completedAt ? new Date(completedAt) : new Date(),
	});
	return Response.json({ log }, { status: 201 });
}

export async function GET() {
	const logs = await todoLogRepository.list();
	return Response.json({ todoLogs: logs });
}
