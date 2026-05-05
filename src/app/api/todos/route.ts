import { createTodoSchema, idSchema } from "@/infra/validation/schemas";

import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { TodoModule } from "@/modules/todo";
import type { NextRequest } from "next/server";
import { z } from "zod";

/**
 * @swagger
 * /api/todos:
 *   get:
 *     tags: [Tasks]
 *     summary: Lista todas as tarefas
 *     responses:
 *       200:
 *         description: Lista de tarefas
 */
export async function GET() {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const todos = await TodoModule.list();
		return Response.json({ todos });
	} catch (error) {
		// Retorna dados vazios em caso de erro para não quebrar o frontend
		return Response.json({ todos: [] });
	}
}

/**
 * @swagger
 * /api/todos:
 *   post:
 *     tags: [Tasks]
 *     summary: Cria uma nova tarefa
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
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tarefa criada
 */
export async function POST(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const body = await request.json();
		const validated = createTodoSchema.omit({ userId: true }).parse(body);

		const todo = await TodoModule.create({
			userId,
			title: String(validated.title),
			observations: String(validated.observations),
			tasks: [],
			difficulty: validated.difficulty as any,
			startDate: validated.startDate ?? new Date(),
			tags: Array.isArray(validated.tags) ? validated.tags.map(String) : [],
			recurrence: validated.recurrence as any,
			recurrenceInterval: validated.recurrenceInterval !== undefined ? Number(validated.recurrenceInterval) : undefined,
		});

		return Response.json({ todo }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}

// export async function PUT(request: NextRequest) {
// 	const { id } = await request.json();
// 	const useCase = new ToggleCompleteUseCase(todoRepo);
// 	await useCase.execute(id);
// 	return new Response(null, { status: 204 });
// }

/**
 * @swagger
 * /api/todos:
 *   patch:
 *     tags: [Tasks]
 *     summary: Atualiza uma tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               observations:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 */
export async function PATCH(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const body = await request.json();
		const validated = createTodoSchema.partial().extend({ id: idSchema }).parse(body);
		const sanitizedId = InputSanitizer.sanitizeId(validated.id);

		const todos = await TodoModule.list();
		const existing = todos.find(t => t.id === sanitizedId);
		if (!existing) {
			return Response.json({ error: "Todo not found" }, { status: 404 });
		}

		const todo = await TodoModule.update({
			...existing,
			id: sanitizedId,
			userId,
			...(validated.title && { title: String(validated.title) }),
			...(validated.observations && { observations: String(validated.observations) }),
			...(validated.difficulty && { difficulty: validated.difficulty as any }),
			...(validated.startDate && { startDate: validated.startDate }),
			...(validated.tags && { tags: Array.isArray(validated.tags) ? validated.tags.map(String) : existing.tags }),
			...(validated.recurrence && { recurrence: validated.recurrence as any }),
			...(validated.recurrenceInterval !== undefined && { recurrenceInterval: Number(validated.recurrenceInterval) }),
		});
		return Response.json({ todo });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Failed to update todo" }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/todos:
 *   delete:
 *     tags: [Tasks]
 *     summary: Deleta uma tarefa
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa a ser deletada
 *     responses:
 *       204:
 *         description: Tarefa deletada com sucesso
 *       400:
 *         description: ID obrigatório
 *       404:
 *         description: Tarefa não encontrada
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
		await TodoModule.delete(sanitizedId);
		return new Response(null, { status: 204 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Failed to delete todo" }, { status: 500 });
	}
}
