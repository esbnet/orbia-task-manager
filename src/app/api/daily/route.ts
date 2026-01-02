import { createDailySchema, idSchema, updateDailySchema } from "@/infra/validation/schemas";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";

import { CreateDailyUseCase } from "@/application/use-cases/daily/create-daily/create-daily-use-case";
import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily/delete-daily-use-case";
import { ListDailyUseCase } from "@/application/use-cases/daily/list-daily/list-daily-use-case";
import { UpdateDailyUseCase } from "@/application/use-cases/daily/update-daily/update-daily-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Instância única do repositório
// const dailyRepo = new InJsonFileDailyRepository();
const dailyRepo = new PrismaDailyRepository();

/**
 * @swagger
 * /api/daily:
 *   get:
 *     tags: [Daily Activities]
 *     summary: Lista atividades diárias
 *     responses:
 *       200:
 *         description: Lista de atividades diárias
 */
export async function GET() {
	try {
		const useCase = new ListDailyUseCase(dailyRepo);
		const result = await useCase.execute();
		return Response.json({ daily: result.daily });
	} catch (error) {
		console.error("Erro na API daily:", error);
		// Retorna dados vazios em caso de erro para não quebrar o frontend
		return Response.json({ daily: [] });
	}
}

/**
 * @swagger
 * /api/daily:
 *   post:
 *     tags: [Daily Activities]
 *     summary: Cria uma nova atividade diária
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
 *               repeat:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   frequency:
 *                     type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Atividade diária criada
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = createDailySchema.parse(body);
		
		const sanitizedInput = {
			title: String(validated.title),
			observations: String(validated.observations),
			tasks: Array.isArray(validated.tasks) ? validated.tasks.map(String) : [],
			difficulty: validated.difficulty,
			repeat: {
				type: validated.repeat?.type || "Diariamente",
				frequency: Number(validated.repeat?.frequency || 1),
			},
			startDate: new Date(),
			tags: Array.isArray(validated.tags) ? validated.tags.map(String) : [],
			createdAt: new Date(),
		};
		
		const useCase = new CreateDailyUseCase(dailyRepo);
		const result = await useCase.execute(sanitizedInput);

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
// 	const useCase = new ToggleCompleteUseCase(dailyRepo);
// 	await useCase.execute(id);
// 	return new Response(null, { status: 204 });
// }

/**
 * @swagger
 * /api/daily:
 *   patch:
 *     summary: Atualiza uma atividade diária
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daily:
 *                 type: object
 *     responses:
 *       200:
 *         description: Atividade diária atualizada
 */
export async function PATCH(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = updateDailySchema.parse(body);
		
		const useCase = new UpdateDailyUseCase(dailyRepo);

		// Fetch existing daily to ensure required fields (userId, startDate, createdAt) are present
		const existing = await dailyRepo.findById(validated.daily.id);
		if (!existing) {
			return Response.json({ error: "Daily not found" }, { status: 404 });
		}

		// Sanitize validated input to prevent code injection
		const sanitizedUpdate = {
			...(validated.daily.title && { title: String(validated.daily.title) }),
			...(validated.daily.observations && { observations: String(validated.daily.observations) }),
			...(validated.daily.tasks && { tasks: Array.isArray(validated.daily.tasks) ? validated.daily.tasks.map(String) : [] }),
			...(validated.daily.difficulty && { difficulty: validated.daily.difficulty }),
			...(validated.daily.tags && { tags: Array.isArray(validated.daily.tags) ? validated.daily.tags.map(String) : [] }),
			...(validated.daily.repeat && {
				repeat: {
					type: validated.daily.repeat.type,
					frequency: Number(validated.daily.repeat.frequency ?? 1)
				}
			})
		};

		// Merge existing record with sanitized update and ensure all fields are sanitized
		const input = { 
			id: String(validated.daily.id),
			userId: String(existing.userId),
			title: String(sanitizedUpdate.title ?? existing.title),
			observations: String(sanitizedUpdate.observations ?? existing.observations),
			tasks: sanitizedUpdate.tasks ?? existing.tasks,
			difficulty: sanitizedUpdate.difficulty ?? existing.difficulty,
			repeat: sanitizedUpdate.repeat || existing.repeat,
			startDate: existing.startDate,
			tags: sanitizedUpdate.tags ?? existing.tags,
			createdAt: existing.createdAt
		};

		const updatedDaily = await useCase.execute(input);
		return Response.json({ daily: updatedDaily }, { status: 200 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json({ error: "Failed to update daily" }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/daily:
 *   delete:
 *     summary: Deleta uma atividade diária
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Atividade diária deletada
 *       400:
 *         description: ID obrigatório
 */
export async function DELETE(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);
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
