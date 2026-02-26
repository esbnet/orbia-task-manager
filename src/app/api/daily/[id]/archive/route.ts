import { ArchiveDailyUseCase } from "@/application/use-cases/daily/archive-daily/archive-daily-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import type { NextRequest } from "next/server";

const dailyRepo = new PrismaDailyRepository();

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const useCase = new ArchiveDailyUseCase(dailyRepo);
		await useCase.execute(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json({ error: "Failed to archive daily" }, { status: 500 });
	}
}
