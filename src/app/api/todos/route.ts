import { createTodoSchema, idSchema } from "@/infra/validation/schemas";

import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/delete-todo/delete-todo-use-case";
import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { UpdateTodoUseCase } from "@/application/use-cases/todo/update-todo/update-todo-use-case";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Instâncias únicas
const todoRepo = new PrismaTodoRepository();
const listTodosUseCase = new ListTodosUseCase(todoRepo);
const createTodoUseCase = new CreateTodoUseCase(todoRepo);
const updateTodoUseCase = new UpdateTodoUseCase(todoRepo);
const deleteTodoUseCase = new DeleteTodoUseCase(todoRepo);

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
		const result = await listTodosUseCase.execute();
		return Response.json({ todos: result.todos });
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
		const body = await request.json();
		const validated = createTodoSchema.omit({ userId: true }).parse(body);
		
		const sanitizedInput = {
			userId: "",
			title: String(validated.title),
			observations: String(validated.observations),
			tasks: [],
			difficulty: validated.difficulty,
			startDate: new Date(),
			tags: Array.isArray(validated.tags) ? validated.tags.map(String) : [],
			recurrence: validated.recurrence,
			recurrenceInterval: validated.recurrenceInterval ? Number(validated.recurrenceInterval) : undefined,
			createdAt: new Date(),
		};

		const result = await createTodoUseCase.execute(sanitizedInput);
		return Response.json(result, { status: 201 });
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
		const body = await request.json();
		const validated = createTodoSchema.partial().extend({ id: idSchema }).parse(body);
		
		const existing = await todoRepo.findById(validated.id!);
		if (!existing) {
			return Response.json({ error: "Todo not found" }, { status: 404 });
		}

		const sanitizedUpdate = {
			...(validated.title && { title: String(validated.title) }),
			...(validated.observations && { observations: String(validated.observations) }),
			...(validated.difficulty && { difficulty: validated.difficulty }),
			...(validated.tags && { tags: Array.isArray(validated.tags) ? validated.tags.map(String) : [] }),
			...(validated.recurrence && { recurrence: validated.recurrence }),
			...(validated.recurrenceInterval && { recurrenceInterval: Number(validated.recurrenceInterval) }),
		};
		
		const todoData = { 
			...existing, 
			...sanitizedUpdate,
			id: String(validated.id),
			// Ensure we're passing a primitive (string) todoType to the use case,
			// not a TodoTypeValueObject instance.
			todoType: (existing as any)?.todoType?.getValue?.() ?? (existing as any)?.todoType,
		};
		const updatedTodo = await updateTodoUseCase.execute(todoData);
		return Response.json({ todo: updatedTodo }, { status: 200 });
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
		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		const validatedId = idSchema.parse(id);
		await deleteTodoUseCase.execute(validatedId);
		return new Response(null, { status: 204 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Failed to delete todo" }, { status: 500 });
	}
}
