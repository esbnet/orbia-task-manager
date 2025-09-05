import { CreateDailyUseCase } from "@/application/use-cases/daily/create-daily/create-daily-use-case";
import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily/delete-daily-use-case";
import { ListDailyUseCase } from "@/application/use-cases/daily/list-daily/list-daily-use-case";
import { UpdateDailyUseCase } from "@/application/use-cases/daily/update-daily/update-daily-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import type { NextRequest } from "next/server";

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
	const { userId, title, observations, tasks, difficulty, repeat, tags } =
		await request.json();
	const useCase = new CreateDailyUseCase(dailyRepo);
	const result = await useCase.execute({
		userId: userId, // Default value
		title: title,
		observations: observations || "", // Default value
		tasks: tasks || [], // Default value
		difficulty: difficulty || "Fácil", // Default value
		startDate: new Date(),
		repeat: {
			type: repeat.type || "Diária",
			frequency: 1, // Default value
		},
		tags: tags || [], // Default value
		createdAt: new Date(),
	});
	return Response.json(result, { status: 201 });
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
	const { daily } = await request.json();
	const useCase = new UpdateDailyUseCase(dailyRepo);
	const updatedDaily = await useCase.execute(daily);
	return Response.json({ daily: updatedDaily }, { status: 200 });
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
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	const useCase = new DeleteDailyUseCase(dailyRepo);
	await useCase.execute(id);
	return new Response(null, { status: 204 });
}
