import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import type { NextRequest } from "next/server";

const dailyLogRepository = new PrismaDailyLogRepository();

export async function POST(request: NextRequest) {
	const { dailyId, dailyTitle, difficulty, tags, completedAt } =
		await request.json();
	const log = await dailyLogRepository.create({
		dailyId,
		dailyTitle,
		difficulty,
		tags,
		completedAt: completedAt ? new Date(completedAt) : new Date(),
	});
	return Response.json({ log }, { status: 201 });
}

export async function GET() {
	const logs = await dailyLogRepository.list();
	return Response.json({ dailyLogs: logs });
}
