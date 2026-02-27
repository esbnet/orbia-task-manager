import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { UseCaseFactory } from "@/infra/di/use-case-factory";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { idSchema } from "@/infra/validation/schemas";
import type { NextRequest } from "next/server";
import { z } from "zod";

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
		const result = await UseCaseFactory.createCompletePontualTodoUseCase().execute({ id: sanitizedId });

		return Response.json({
			todo: result.todo,
			log: result.log,
			message: "Tarefa pontual concluída com sucesso"
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}

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
