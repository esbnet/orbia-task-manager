import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily/delete-daily-use-case";
import { UpdateDailyUseCase } from "@/application/use-cases/daily/update-daily/update-daily-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { updateDailySchema } from "@/infra/validation/schemas";
import type { NextRequest } from "next/server";
import { z } from "zod";

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
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	try {
		const sanitizedId = InputSanitizer.sanitizeId(id);
		const allDailies = await dailyRepo.list();
		const daily = allDailies.find(d => d.id === sanitizedId);

		if (!daily) {
			return Response.json({ error: "Daily not found" }, { status: 404 });
		}

		return Response.json({ daily });
	} catch (error) {
		if (error instanceof Error && error.message.includes('Invalid ID')) {
			return Response.json({ error: error.message }, { status: 400 });
		}
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
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	try {
		const sanitizedId = InputSanitizer.sanitizeId(id);
		const body = await request.json();
		
		// Validate with Zod schema
		const validated = updateDailySchema.parse({ daily: { ...body, id: sanitizedId } });
		
		// Fetch existing to ensure it exists
		const existing = await dailyRepo.findById(sanitizedId);
		if (!existing) {
			return Response.json({ error: "Daily not found" }, { status: 404 });
		}
		
		// Merge with validated data
		const dailyData = { 
			...existing, 
			...validated.daily,
			repeat: validated.daily.repeat ? {
				type: validated.daily.repeat.type,
				frequency: validated.daily.repeat.frequency ?? 1
			} : existing.repeat
		};

		const useCase = new UpdateDailyUseCase(dailyRepo);
		const updatedDaily = await useCase.execute(dailyData);

		return Response.json({ daily: updatedDaily });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		if (error instanceof Error && error.message.includes('Invalid ID')) {
			return Response.json({ error: error.message }, { status: 400 });
		}
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
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	try {
		const sanitizedId = InputSanitizer.sanitizeId(id);
		const useCase = new DeleteDailyUseCase(dailyRepo);
		await useCase.execute(sanitizedId);

		return new Response(null, { status: 204 });
	} catch (error) {
		if (error instanceof Error && error.message.includes('Invalid ID')) {
			return Response.json({ error: error.message }, { status: 400 });
		}
		return Response.json({ error: "Failed to delete daily" }, { status: 500 });
	}
}