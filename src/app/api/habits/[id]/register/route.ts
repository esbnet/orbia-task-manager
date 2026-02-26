import { RegisterHabitUseCase } from "@/application/use-cases/habit/register-habit-use-case/register-habit-use-case";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { idSchema } from "@/infra/validation/schemas";
import { z } from "zod";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();
const habitPeriodRepository = new PrismaHabitPeriodRepository();
const habitEntryRepository = new PrismaHabitEntryRepository();

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);

		const bodySchema = z.object({
			note: z.string().optional(),
		});
		const validatedBody = bodySchema.parse(body);

		const useCase = new RegisterHabitUseCase(
			habitRepository,
			habitPeriodRepository,
			habitEntryRepository
		);

		const result = await useCase.execute({
			habitId: sanitizedId,
			note: validatedBody.note ? String(validatedBody.note) : undefined,
		});

		return Response.json(result, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
