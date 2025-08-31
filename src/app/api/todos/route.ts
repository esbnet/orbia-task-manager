import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/delete-todo/delete-todo-use-case";
import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { UpdateTodoUseCase } from "@/application/use-cases/todo/update-todo/update-todo-use-case";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import type { NextRequest } from "next/server";

// Instância única do repositório
// const todoRepo = new InJsonFileTodoRepository();
const todoRepo = new PrismaTodoRepository();

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Lista todas as tarefas
 *     responses:
 *       200:
 *         description: Lista de tarefas
 */
export async function GET() {
	const useCase = new ListTodosUseCase(todoRepo);
	const result = await useCase.execute();
	return Response.json({ todos: result.todos });
}

/**
 * @swagger
 * /api/todos:
 *   post:
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
	const { userId, title, observations, tasks, difficulty, startDate, tags } =
		await request.json();
	const useCase = new CreateTodoUseCase(todoRepo);
	const result = await useCase.execute({
		userId,
		title: title,
		observations: observations || "",
		tasks: tasks || ([] as string[]),
		difficulty: difficulty || "Fácil",
		startDate: startDate || new Date(),
		tags: tags || ([] as string[]),
		createdAt: new Date(),
	});
	return Response.json(result, { status: 201 });
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
 *     summary: Atualiza uma tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 */
export async function PATCH(request: NextRequest) {
	const { todo } = await request.json();
	const useCase = new UpdateTodoUseCase(todoRepo);
	const updatedTodo = await useCase.execute(todo);
	return Response.json({ todo: updatedTodo }, { status: 200 });
}

/**
 * @swagger
 * /api/todos:
 *   delete:
 *     summary: Deleta uma tarefa
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tarefa deletada
 *       400:
 *         description: ID obrigatório
 */
export async function DELETE(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	const useCase = new DeleteTodoUseCase(todoRepo);
	await useCase.execute(id);
	return new Response(null, { status: 204 });
}
