import { CreateGoalUseCase } from "@/application/use-cases/goal/create-goal/create-goal-use-case";
import type { Goal } from "@/domain/entities/goal";
import { ListGoalsUseCase } from "@/application/use-cases/goal/list-goals/list-goals-use-case";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaGoalRepository } from "@/infra/database/prisma/prisma-goal-repository";
import { auth } from "@/auth";

const goalRepository = new PrismaGoalRepository();
const createGoalUseCase = new CreateGoalUseCase(goalRepository);
const listGoalsUseCase = new ListGoalsUseCase(goalRepository);
/**
 * @swagger
 * /api/goals:
 *   get:
 *     tags: [Goals]
 *     summary: Lista metas com filtros
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_PROGRESS, COMPLETED, CANCELLED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [PERSONAL, WORK, HEALTH, LEARNING]
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeOverdue
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeDueSoon
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: dueSoonDays
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de metas
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno
 */
export async function GET(request: NextRequest) {
	try {
		// Autenticação
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 401 },
			);
		}

		// Parsing e validação de parâmetros
		const { searchParams } = new URL(request.url);

		// Validação de status
		const statusParam = searchParams.get("status");
		const validStatuses: Goal["status"][] = ["IN_PROGRESS", "COMPLETED", "CANCELLED"];
		const status = statusParam && validStatuses.includes(statusParam as Goal["status"])
			? statusParam as Goal["status"]
			: undefined;

		// Validação de priority
		const priorityParam = searchParams.get("priority");
		const validPriorities: Goal["priority"][] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
		const priority = priorityParam && validPriorities.includes(priorityParam as Goal["priority"])
			? priorityParam as Goal["priority"]
			: undefined;

		// Validação de tags
		const tagsParam = searchParams.get("tags");
		const tags = tagsParam ? tagsParam.split(",").map(tag => tag.trim()).filter(Boolean) : [];

		// Validação de parâmetros boolean
		const includeOverdue = searchParams.get("includeOverdue") === "true";
		const includeDueSoon = searchParams.get("includeDueSoon") === "true";

		// Validação de dueSoonDays
		const dueSoonDaysParam = searchParams.get("dueSoonDays");
		const dueSoonDays = dueSoonDaysParam ?
			Math.max(1, Math.min(365, Number.parseInt(dueSoonDaysParam, 10) || 7)) : 7;

		// Log apenas em desenvolvimento
		if (process.env.NODE_ENV === "development") {
			console.log({
				userId: session.user.id,
				params: { status, priority, tags, includeOverdue, includeDueSoon, dueSoonDays }
			});
		}

		// Execução do use case
		const goals = await listGoalsUseCase.execute({
			userId: session.user.id,
			status,
			priority,
			tags,
			includeOverdue,
			includeDueSoon,
			dueSoonDays,
		});

		// Log de resultado apenas em desenvolvimento
		if (process.env.NODE_ENV === "development") {
		}

		return NextResponse.json(goals);
	} catch (error) {

		// Tratamento específico de erros
		if (error instanceof Error) {
			if (error.message.includes("unauthorized") || error.message.includes("forbidden")) {
				return NextResponse.json(
					{ error: "Acesso negado" },
					{ status: 403 },
				);
			}

			if (error.message.includes("validation") || error.message.includes("invalid")) {
				return NextResponse.json(
					{ error: "Parâmetros inválidos" },
					{ status: 400 },
				);
			}
		}

		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}

/**
 * @swagger
 * /api/goals:
 *   post:
 *     tags: [Goals]
 *     summary: Cria uma nova meta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - targetDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               category:
 *                 type: string
 *                 enum: [PERSONAL, WORK, HEALTH, LEARNING]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Meta criada
 *       401:
 *         description: Não autorizado
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Meta com título já existe
 *       500:
 *         description: Erro interno
 */
export async function POST(request: NextRequest) {
	try {
		// Autenticação
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 401 },
			);
		}

		// Parsing do body
		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: "JSON inválido" },
				{ status: 400 },
			);
		}

		const { title, description, targetDate, priority, category, tags } = body;

		// Validação de campos obrigatórios
		if (!title || typeof title !== "string" || title.trim().length === 0) {
			return NextResponse.json(
				{ error: "Título é obrigatório e deve ser uma string não vazia" },
				{ status: 400 },
			);
		}

		if (!targetDate) {
			return NextResponse.json(
				{ error: "Data alvo é obrigatória" },
				{ status: 400 },
			);
		}

		// Validação de data
		const parsedDate = new Date(targetDate);
		if (isNaN(parsedDate.getTime())) {
			return NextResponse.json(
				{ error: "Data alvo inválida" },
				{ status: 400 },
			);
		}

		// Validação de priority
		const validPriorities: Goal["priority"][] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
		const validatedPriority = priority && validPriorities.includes(priority)
			? priority
			: "MEDIUM";

		// Validação de category
		const validCategories: Goal["category"][] = ["PERSONAL", "WORK", "HEALTH", "LEARNING"];
		const validatedCategory = category && validCategories.includes(category)
			? category
			: "PERSONAL";

		// Validação de tags
		const validatedTags = Array.isArray(tags)
			? tags.filter(tag => typeof tag === "string" && tag.trim().length > 0)
			: [];

		// Log apenas em desenvolvimento
		if (process.env.NODE_ENV === "development") {
			console.log({
				userId: session.user.id,
				title: title.substring(0, 50) + (title.length > 50 ? "..." : "")
			});
		}

		// Execução do use case
		const goal = await createGoalUseCase.execute({
			title: title.trim(),
			description: (description || "").trim(),
			targetDate: parsedDate,
			priority: validatedPriority,
			tags: validatedTags,
			userId: session.user.id,
		});

		return NextResponse.json(goal, { status: 201 });
	} catch (error) {

		// Tratamento específico de erros
		if (error instanceof Error) {
			if (error.message.includes("unauthorized") || error.message.includes("forbidden")) {
				return NextResponse.json(
					{ error: "Acesso negado" },
					{ status: 403 },
				);
			}

			if (error.message.includes("validation") || error.message.includes("invalid")) {
				return NextResponse.json(
					{ error: "Dados inválidos" },
					{ status: 400 },
				);
			}

			if (error.message.includes("duplicate") || error.message.includes("unique")) {
				return NextResponse.json(
					{ error: "Meta com este título já existe" },
					{ status: 409 },
				);
			}
		}

		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}
