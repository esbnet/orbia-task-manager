import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { idSchema } from "@/infra/validation/schemas";
import { TodoModule } from "@/modules/todo";
import type { NextRequest } from "next/server";
import { z } from "zod";

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
		const result = await TodoModule.toggle(sanitizedId);
		return Response.json({ todo: result });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json(
			{ error: error instanceof Error ? error.message : "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}
