import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily/delete-daily-use-case";
import { UpdateDailyUseCase } from "@/application/use-cases/daily/update-daily/update-daily-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import type { NextRequest } from "next/server";

// Instância única do repositório
const dailyRepo = new PrismaDailyRepository();

/**
 * @swagger
 * /api/daily/{id}:
 *   get:
 *     tags: [Daily Activities]
 *     summary: Obtém uma atividade diária específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Atividade diária encontrada
 *       404:
 *         description: Atividade diária não encontrada
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	try {
		// For now, we'll get all dailies and find the one with the matching ID
		// TODO: Implement a proper getById use case
		const allDailies = await dailyRepo.list();
		const daily = allDailies.find(d => d.id === id);

		if (!daily) {
			return Response.json({ error: "Daily not found" }, { status: 404 });
		}

		return Response.json({ daily });
	} catch (error) {
		console.error("Error fetching daily:", error);
		return Response.json({ error: "Failed to fetch daily" }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/daily/{id}:
 *   patch:
 *     tags: [Daily Activities]
 *     summary: Atualiza uma atividade diária específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *               repeat:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Atividade diária atualizada
 *       404:
 *         description: Atividade diária não encontrada
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	try {
		const updateData = await request.json();

		// Add the ID to the update data
		const dailyData = { ...updateData, id };

		const useCase = new UpdateDailyUseCase(dailyRepo);
		const updatedDaily = await useCase.execute(dailyData);

		return Response.json({ daily: updatedDaily });
	} catch (error) {
		console.error("Error updating daily:", error);
		return Response.json({ error: "Failed to update daily" }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/daily/{id}:
 *   delete:
 *     tags: [Daily Activities]
 *     summary: Deleta uma atividade diária específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Atividade diária deletada
 *       404:
 *         description: Atividade diária não encontrada
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	try {
		const useCase = new DeleteDailyUseCase(dailyRepo);
		await useCase.execute(id);

		return new Response(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting daily:", error);
		return Response.json({ error: "Failed to delete daily" }, { status: 500 });
	}
}