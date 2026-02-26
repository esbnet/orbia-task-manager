import { UpdateHabitUseCase } from "@/application/use-cases/habit/update-habit/update-habit-use-case";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { idSchema } from "@/infra/validation/schemas";
import { z } from "zod";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const habit = await habitRepository.findById(id);

		if (!habit) {
			return Response.json({ error: "Habit not found" }, { status: 404 });
		}

		return Response.json({ habit });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);

		const updateSchema = z.object({
			habit: z.object({
				title: z.string().optional(),
				description: z.string().optional(),
				difficulty: z.enum(["Trivial", "Fácil", "Médio", "Difícil"]).optional(),
				resetType: z.enum(["daily", "weekly", "monthly"]).optional(),
				tags: z.array(z.string()).optional(),
			}).passthrough(),
		});
		const validated = updateSchema.parse(body);

		// Buscar o hábito existente
		const existingHabit = await habitRepository.findById(sanitizedId);
		if (!existingHabit) {
			return Response.json({ error: "Habit not found" }, { status: 404 });
		}

		// Sanitizar dados de atualização
		const sanitizedUpdate = {
			...(validated.habit.title && { title: String(validated.habit.title) }),
			...(validated.habit.description && { description: String(validated.habit.description) }),
			...(validated.habit.difficulty && { difficulty: validated.habit.difficulty }),
			...(validated.habit.resetType && { resetType: validated.habit.resetType }),
			...(validated.habit.tags && { tags: validated.habit.tags.map(String) }),
		};

		// Mesclar os dados existentes com as atualizações
		const updatedHabitData = {
			...existingHabit,
			...sanitizedUpdate,
			id: sanitizedId,
			updatedAt: new Date(),
		};

		const useCase = new UpdateHabitUseCase(habitRepository);
		const result = await useCase.execute(updatedHabitData);

		return Response.json({ habit: result });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await habitRepository.delete(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
