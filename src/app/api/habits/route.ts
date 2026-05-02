import { createHabitSchema, idSchema } from "@/infra/validation/schemas";

import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { HabitModule } from "@/modules/habit";
import type { NextRequest } from "next/server";
import { z } from "zod";

/**
 * @swagger
 * /api/habits:
 *   get:
 *     tags: [Habits]
 *     summary: Lista todos os hábitos
 *     responses:
 *       200:
 *         description: Lista de hábitos
 */
export async function GET() {
	try {
		const habits = await HabitModule.list();
		return Response.json({ habits });
	} catch (error) {
		// Retorna dados vazios em caso de erro para não quebrar o frontend
		return Response.json({ habits: [] });
	}
}

/**
 * @swagger
 * /api/habits:
 *   post:
 *     tags: [Habits]
 *     summary: Cria um novo hábito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               observations:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               priority:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Hábito criado
 */
export async function POST(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const body = await request.json();
		const validated = createHabitSchema.parse(body);

		const habit = await HabitModule.create({
			userId,
			title: String(validated.title),
			observations: String(validated.description || ""),
			difficulty: validated.difficulty,
			priority: "Média" as const,
			tags: Array.isArray(validated.tags) ? validated.tags.map(String) : [],
			reset: "Sempre disponível" as const,
		});

		return Response.json({ habit }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/habits:
 *   put:
 *     tags: [Habits]
 *     summary: Alterna o status de conclusão de um hábito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       204:
 *         description: Status alternado
 */
export async function PUT(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const body = await request.json();
		const schema = z.object({ id: idSchema });
		const validated = schema.parse(body);
		const sanitizedId = InputSanitizer.sanitizeId(validated.id);

		await HabitModule.toggle(sanitizedId);
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

/**
 * @swagger
 * /api/habits:
 *   patch:
 *     tags: [Habits]
 *     summary: Atualiza um hábito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habit:
 *                 type: object
 *     responses:
 *       200:
 *         description: Hábito atualizado
 */
export async function PATCH(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const body = await request.json();
		const schema = z.object({
			habit: z.object({
				id: idSchema,
			}).passthrough(),
		});
		const validated = schema.parse(body);

		const sanitizedId = InputSanitizer.sanitizeId(validated.habit.id);
		const existingHabit = await HabitModule.list().then((items) =>
			items.find((item) => item.id === sanitizedId),
		);
		if (!existingHabit) {
			return Response.json({ error: "Hábito não encontrado" }, { status: 404 });
		}

		const habitPatch = validated.habit as Partial<typeof existingHabit>;
		const updatedHabit = await HabitModule.update({
			id: sanitizedId,
			userId,
			title: String(habitPatch.title ?? existingHabit.title),
			observations: String(
				habitPatch.observations ?? existingHabit.observations ?? ""
			),
			difficulty: (habitPatch.difficulty ??
				existingHabit.difficulty) as typeof existingHabit.difficulty,
			status: (habitPatch.status ??
				existingHabit.status) as typeof existingHabit.status,
			priority: (habitPatch.priority ??
				existingHabit.priority) as typeof existingHabit.priority,
			tags: Array.isArray(habitPatch.tags)
				? habitPatch.tags.map(String)
				: existingHabit.tags,
			reset: (habitPatch.reset ??
				existingHabit.reset) as typeof existingHabit.reset,
			createdAt: existingHabit.createdAt,
			updatedAt: new Date(),
			order:
				typeof habitPatch.order === "number"
					? habitPatch.order
					: existingHabit.order,
			lastCompletedDate:
				typeof habitPatch.lastCompletedDate === "string"
					? habitPatch.lastCompletedDate
					: existingHabit.lastCompletedDate,
		});

		return Response.json({ habit: updatedHabit }, { status: 200 });
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

/**
 * @swagger
 * /api/habits:
 *   delete:
 *     tags: [Habits]
 *     summary: Deleta um hábito
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Hábito deletado
 *       400:
 *         description: ID obrigatório
 */
export async function DELETE(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);

		await HabitModule.delete(sanitizedId);
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
