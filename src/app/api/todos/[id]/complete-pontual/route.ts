import { CompletePontualUseCase } from "@/application/use-cases/todo/complete-pontual/complete-pontual-use-case";
import { PrismaTodoLogRepository } from "@/infra/database/prisma/prisma-todo-log-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import type { NextRequest } from "next/server";

const todoRepo = new PrismaTodoRepository();
const todoLogRepo = new PrismaTodoLogRepository();
const completePontualUseCase = new CompletePontualUseCase(todoRepo, todoLogRepo);

/**
 * @swagger
 * /api/todos/{id}/complete-pontual:
 *   post:
 *     tags: [Tasks]
 *     summary: Marca tarefa pontual como concluída (não reaparece)
 *     description: Completa uma tarefa pontual que não reaparecerá após conclusão. Ideal para atividades únicas ou projetos com prazo definido.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa pontual marcada como concluída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     lastCompletedDate:
 *                       type: string
 *                     todoType:
 *                       type: string
 *                       enum: [pontual, recorrente]
 *       400:
 *         description: Operação inválida (tarefa não é pontual ou já está completa)
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const result = await completePontualUseCase.execute({ id });

		return Response.json({
			todo: result.todo,
			log: result.log,
			message: "Tarefa pontual concluída com sucesso"
		});
	} catch (error) {

		if (error instanceof Error) {
			if (error.message.includes("não é pontual")) {
				return Response.json(
					{ error: "Esta operação é válida apenas para tarefas pontuais" },
					{ status: 400 }
				);
			}
			if (error.message.includes("já está concluída")) {
				return Response.json(
					{ error: "Tarefa já está concluída" },
					{ status: 400 }
				);
			}
			if (error.message.includes("not found")) {
				return Response.json(
					{ error: "Tarefa não encontrada" },
					{ status: 404 }
				);
			}
		}

		return Response.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}