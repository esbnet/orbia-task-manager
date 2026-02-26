import { ToggleTodoUseCase } from "@/application/use-cases/todo/toggle-todo/toggle-todo-use-case";
import { PrismaTodoLogRepository } from "@/infra/database/prisma/prisma-todo-log-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import type { NextRequest } from "next/server";

const todoRepo = new PrismaTodoRepository();
const todoLogRepo = new PrismaTodoLogRepository();
const toggleCompleteUseCase = new ToggleTodoUseCase(todoRepo, todoLogRepo);

/**
 * @swagger
 * /api/todos/{id}/complete:
 *   post:
 *     tags: [Tasks]
 *     summary: Marca/desmarca todo como concluído
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo atualizado
 *       404:
 *         description: Todo não encontrado
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const result = await toggleCompleteUseCase.execute(id);
		return Response.json({ todo: result.todo });
	} catch (error) {
		return Response.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}