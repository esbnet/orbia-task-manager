import { createHabitSchema, idSchema } from "@/infra/validation/schemas";

import { CreateHabitUseCase } from "@/application/use-cases/habit/create-habit/create-habit-use-case";
import { DeleteHabitUseCase } from "@/application/use-cases/habit/delete-habit/delete-habit-use-case";
import { ListHabitsUseCase } from "@/application/use-cases/habit/list-habit/list-task-use-case";
import { ToggleCompleteUseCase as ToggleCompleteHabitUseCase } from "@/application/use-cases/habit/toggle-complete-habit/toggle-complete-habit-use-case";
import { UpdateHabitUseCase } from "@/application/use-cases/habit/update-habit/update-habit-use-case";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Instância única do repositório
//const habitRepository = new InJsonFileHabitRepository();
const habitRepository = new PrismaHabitRepository();

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
		const useCase = new ListHabitsUseCase(habitRepository);
		const result = await useCase.execute();
		return Response.json({ habits: result.habits });
	} catch (error) {
		console.error("Erro na API habits:", error);
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
 *               reset:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Hábito criado
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = createHabitSchema.parse(body);

		const resetMap = {
			daily: "Diariamente" as const,
			weekly: "Semanalmente" as const,
			monthly: "Mensalmente" as const,
		};

		const sanitizedInput = {
			userId: String(validated.userId),
			title: String(validated.title),
			observations: String(validated.description || ""),
			difficulty: validated.difficulty,
			priority: "Média" as const,
			tags: Array.isArray(validated.tags) ? validated.tags.map(String) : [],
			reset: resetMap[validated.resetType],
			createdAt: new Date(),
		};

		const useCase = new CreateHabitUseCase(habitRepository);
		const result = await useCase.execute(sanitizedInput);
		return Response.json(result, { status: 201 });
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
		const body = await request.json();
		const schema = z.object({ id: idSchema });
		const validated = schema.parse(body);
		const sanitizedId = InputSanitizer.sanitizeId(validated.id);

		const useCase = new ToggleCompleteHabitUseCase(habitRepository);
		await useCase.execute(sanitizedId);
		return new Response(null, { status: 204 });
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
	const { habit } = await request.json();
	const useCase = new UpdateHabitUseCase(habitRepository);
	const updatedHabit = await useCase.execute(habit);
	return Response.json({ habit: updatedHabit }, { status: 200 });
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
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	const useCase = new DeleteHabitUseCase(habitRepository);
	await useCase.execute(id);
	return new Response(null, { status: 204 });
}
