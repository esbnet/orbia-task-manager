import { PrismaTodoSubtaskRepository } from "@/infra/database/prisma/prisma-todo-subtask-repository";
import { VerifyTodoOwnershipUseCase } from "@/application/use-cases/todo-subtask/verify-todo-ownership-use-case";
import { container } from "@/infra/di/container";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import type { NextRequest } from "next/server";

const subtaskRepo = new PrismaTodoSubtaskRepository();
const verifyOwnershipUseCase = new VerifyTodoOwnershipUseCase(
	container.getTodoRepository()
);

/**
 * @swagger
 * /api/todo-subtasks:
 *   get:
 *     tags: [Todo Subtasks]
 *     summary: Lista subtarefas de um todo
 *     parameters:
 *       - in: query
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do todo pai
 *     responses:
 *       200:
 *         description: Lista de subtarefas
 *       401:
 *         description: Não autenticado
 */
export async function GET(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated", subtasks: [] },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const todoId = searchParams.get("todoId");

		if (todoId) {
			const subtasks = await subtaskRepo.listByTodoId(todoId);
			return Response.json({ subtasks });
		}

		// If no todoId specified, we could return all subtasks for user's todos
		// but this might not be a common use case, so returning empty for now
		return Response.json({ subtasks: [] });
	} catch (error) {
		return Response.json(
			{ error: "Failed to fetch subtasks", subtasks: [] },
			{ status: 500 },
		);
	}
}

/**
 * @swagger
 * /api/todo-subtasks:
 *   post:
 *     tags: [Todo Subtasks]
 *     summary: Cria uma nova subtarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               todoId:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Subtarefa criada
 *       401:
 *         description: Não autenticado
 */
export async function POST(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const { title, todoId, order } = await request.json();

		const subtask = await subtaskRepo.create({
			title,
			completed: false,
			todoId,
			order: order ?? 0,
		});
		return Response.json({ subtask }, { status: 201 });
	} catch (error) {
		return Response.json(
			{ error: "Failed to create subtask" },
			{ status: 500 },
		);
	}
}

/**
 * @swagger
 * /api/todo-subtasks:
 *   patch:
 *     tags: [Todo Subtasks]
 *     summary: Atualiza uma subtarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subtask:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   completed:
 *                     type: boolean
 *                   order:
 *                     type: number
 *     responses:
 *       200:
 *         description: Subtarefa atualizada
 *       401:
 *         description: Não autenticado
 */
export async function PATCH(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const { subtask } = await request.json();

		const updated = await subtaskRepo.update(subtask);
		return Response.json({ subtask: updated });
	} catch (error) {
		return Response.json(
			{ error: "Failed to update subtask" },
			{ status: 500 },
		);
	}
}

/**
 * @swagger
 * /api/todo-subtasks:
 *   delete:
 *     tags: [Todo Subtasks]
 *     summary: Deleta uma subtarefa
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da subtarefa
 *     responses:
 *       204:
 *         description: Subtarefa deletada
 *       400:
 *         description: ID obrigatório
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Subtarefa não encontrada
 */
export async function DELETE(request: NextRequest) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		await subtaskRepo.delete(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json(
			{ error: "Failed to delete subtask" },
			{ status: 500 },
		);
	}
}