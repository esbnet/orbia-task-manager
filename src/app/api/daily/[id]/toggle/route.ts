import { ToggleCompleteUseCase } from "@/application/use-cases/daily/toggle-complete-daily/toggle-complete-daily-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import type { NextRequest } from "next/server";

// Instância única do repositório
const dailyRepo = new PrismaDailyRepository();

/**
 * @swagger
 * /api/daily/{id}/toggle:
 *   patch:
 *     tags: [Daily Activities]
 *     summary: Alterna o status de conclusão de uma atividade diária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status de conclusão alternado com sucesso
 *       404:
 *         description: Atividade diária não encontrada
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	try {
		const useCase = new ToggleCompleteUseCase(dailyRepo);
		const result = await useCase.execute(id);

		return Response.json({
			success: true,
			message: "Daily completion status toggled successfully",
			daily: result
		});
	} catch (error) {
		console.error("Error toggling daily completion:", error);

		// Check if it's a "not found" error
		if (error instanceof Error && error.message.includes("not found")) {
			return Response.json({ error: "Daily not found" }, { status: 404 });
		}

		return Response.json({ error: "Failed to toggle daily completion" }, { status: 500 });
	}
}