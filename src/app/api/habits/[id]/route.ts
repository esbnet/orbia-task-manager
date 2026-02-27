import { UpdateHabitUseCase } from "@/application/use-cases/habit/update-habit/update-habit-use-case";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { idSchema } from "@/infra/validation/schemas";
import { z } from "zod";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { id } = await params;
		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);
		const habit = await habitRepository.findById(sanitizedId);

		if (!habit) {
			return Response.json({ error: "Habit not found" }, { status: 404 });
		}

		return Response.json({ habit });
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

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();

		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);

		const updateSchema = z.object({
			habit: z.object({
				title: z.string().optional(),
				observations: z.string().optional(),
				description: z.string().optional(),
				difficulty: z.enum(["Trivial", "Fácil", "Médio", "Difícil"]).optional(),
				reset: z.enum(["Sempre disponível", "Diariamente", "Semanalmente", "Mensalmente"]).optional(),
				resetType: z.enum(["daily", "weekly", "monthly"]).optional(),
				priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]).optional(),
				status: z.enum(["Em Andamento", "Completo", "Cancelado"]).optional(),
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
		const resetMap: Record<"daily" | "weekly" | "monthly", "Diariamente" | "Semanalmente" | "Mensalmente"> = {
			daily: "Diariamente",
			weekly: "Semanalmente",
			monthly: "Mensalmente",
		};

		const mappedReset =
			validated.habit.reset ??
			(validated.habit.resetType ? resetMap[validated.habit.resetType] : undefined);

		const mappedObservations =
			validated.habit.observations ??
			validated.habit.description;

		const sanitizedUpdate = {
			...(validated.habit.title && { title: String(validated.habit.title) }),
			...(mappedObservations !== undefined && { observations: String(mappedObservations) }),
			...(validated.habit.difficulty && { difficulty: validated.habit.difficulty }),
			...(mappedReset && { reset: mappedReset }),
			...(validated.habit.priority && { priority: validated.habit.priority }),
			...(validated.habit.status && { status: validated.habit.status }),
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
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { id } = await params;
		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);
		await habitRepository.delete(sanitizedId);
		return new Response(null, { status: 204 });
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
