import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/delete-todo/delete-todo-use-case";
import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { UpdateTodoUseCase } from "@/application/use-cases/todo/update-todo/update-todo-use-case";
import { TodoInputValidator } from "@/application/dto/todo-dto";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import type { NextRequest } from "next/server";

// Instâncias únicas
const todoRepo = new PrismaTodoRepository();
const listTodosUseCase = new ListTodosUseCase(todoRepo);
const createTodoUseCase = new CreateTodoUseCase(todoRepo);
const updateTodoUseCase = new UpdateTodoUseCase(todoRepo);
const deleteTodoUseCase = new DeleteTodoUseCase(todoRepo);

/**
 * @swagger
 * /api/todos:
 *   get:
 *     tags: [Tasks]
 *     summary: Lista todas as tarefas
 *     responses:
 *       200:
 *         description: Lista de tarefas
 */
export async function GET() {
	try {
		const result = await listTodosUseCase.execute();
		return Response.json({ todos: result.todos });
	} catch (error) {
		console.error("Erro na API todos:", error);
		// Retorna dados vazios em caso de erro para não quebrar o frontend
		return Response.json({ todos: [] });
	}
}

/**
 * @swagger
 * /api/todos:
 *   post:
 *     tags: [Tasks]
 *     summary: Cria uma nova tarefa
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
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tarefa criada
 */
export async function POST(request: NextRequest) {
	try {
		const rawData = await request.json();
		const validatedInput = TodoInputValidator.validateCreateInput(rawData);
		
		const result = await createTodoUseCase.execute({
			userId: rawData.userId || "", // Will be set by use case
			title: validatedInput.title,
			observations: validatedInput.description || "",
			tasks: [],
			difficulty: "Fácil", // Default for todos
			startDate: new Date(),
			tags: validatedInput.tags,
			createdAt: new Date(),
		});
		return Response.json(result, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Invalid input";
		return Response.json({ error: message }, { status: 400 });
	}
}

// export async function PUT(request: NextRequest) {
// 	const { id } = await request.json();
// 	const useCase = new ToggleCompleteUseCase(todoRepo);
// 	await useCase.execute(id);
// 	return new Response(null, { status: 204 });
// }

/**
 * @swagger
 * /api/todos:
 *   patch:
 *     tags: [Tasks]
 *     summary: Atualiza uma tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               observations:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 */
export async function PATCH(request: NextRequest) {
	try {
		const rawData = await request.json();
		
		// Mapear observations para description para o validador
		const dataForValidation = {
			...rawData,
			description: rawData.observations
		};
		
		const validatedInput = TodoInputValidator.validateUpdateInput(dataForValidation);
		
		// Mapear de volta description para observations
		const todoData = {
			id: validatedInput.id,
			title: validatedInput.title || rawData.title || "",
			observations: validatedInput.description || "",
			userId: rawData.userId || "temp-dev-user",
			tasks: rawData.tasks || [],
			difficulty: rawData.difficulty || "Fácil",
			startDate: rawData.startDate ? new Date(rawData.startDate) : new Date(),
			tags: validatedInput.tags || [],
			createdAt: rawData.createdAt ? new Date(rawData.createdAt) : new Date()
		};
		
		const updatedTodo = await updateTodoUseCase.execute(todoData);
		return Response.json({ todo: updatedTodo }, { status: 200 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Invalid input";
		return Response.json({ error: message }, { status: 400 });
	}
}

/**
 * @swagger
 * /api/todos:
 *   delete:
 *     tags: [Tasks]
 *     summary: Deleta uma tarefa
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa a ser deletada
 *     responses:
 *       204:
 *         description: Tarefa deletada com sucesso
 *       400:
 *         description: ID obrigatório
 *       404:
 *         description: Tarefa não encontrada
 */
export async function DELETE(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	await deleteTodoUseCase.execute(id);
	return new Response(null, { status: 204 });
}
