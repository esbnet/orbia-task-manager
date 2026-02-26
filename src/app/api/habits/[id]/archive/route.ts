import { ArchiveHabitUseCase } from "@/application/use-cases/habit/archive-habit/archive-habit-use-case";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepo = new PrismaHabitRepository();

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const useCase = new ArchiveHabitUseCase(habitRepo);
		await useCase.execute(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json({ error: "Failed to archive habit" }, { status: 500 });
	}
}
