import { PrismaTodoSubtaskRepository } from "@/infra/database/prisma/prisma-todo-subtask-repository";
import { getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";
import type { NextRequest } from "next/server";

const subtaskRepo = new PrismaTodoSubtaskRepository();

export async function GET(request: NextRequest) {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated", subtasks: [] },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const todoId = searchParams.get("todoId");

		if (todoId) {
			// First verify that the todo belongs to the authenticated user
			const todo = await prisma.todo.findFirst({
				where: { id: todoId, userId },
			});

			if (!todo) {
				return Response.json(
					{ error: "Todo not found or not authorized", subtasks: [] },
					{ status: 404 },
				);
			}

			const subtasks = await subtaskRepo.listByTodoId(todoId);
			return Response.json({ subtasks });
		}

		// If no todoId specified, we could return all subtasks for user's todos
		// but this might not be a common use case, so returning empty for now
		return Response.json({ subtasks: [] });
	} catch (error) {
		return Response.json(
			{ error: "Failed to fetch subtasks", subtasks: [] },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const { title, todoId, order } = await request.json();
		
		// Verify that the todo belongs to the authenticated user
		const todo = await prisma.todo.findFirst({
			where: { id: todoId, userId },
		});

		if (!todo) {
			return Response.json(
				{ error: "Todo not found or not authorized" },
				{ status: 404 },
			);
		}

		const subtask = await subtaskRepo.create({
			title,
			completed: false,
			todoId,
			order: order ?? 0,
		});
		return Response.json({ subtask }, { status: 201 });
	} catch (error) {
		return Response.json(
			{ error: "Failed to create subtask" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const { subtask } = await request.json();
		
		// Verify that the subtask's todo belongs to the authenticated user
		const todo = await prisma.todo.findFirst({
			where: { id: subtask.todoId, userId },
		});

		if (!todo) {
			return Response.json(
				{ error: "Todo not found or not authorized" },
				{ status: 404 },
			);
		}

		const updated = await subtaskRepo.update(subtask);
		return Response.json({ subtask: updated });
	} catch (error) {
		return Response.json(
			{ error: "Failed to update subtask" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return Response.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		// First get the subtask to find its todo
		const existingSubtask = await prisma.todoSubtask.findUnique({
			where: { id },
			select: { todoId: true },
		});

		if (!existingSubtask) {
			return Response.json(
				{ error: "Subtask not found" },
				{ status: 404 },
			);
		}

		// Verify that the subtask's todo belongs to the authenticated user
		const todo = await prisma.todo.findFirst({
			where: { id: existingSubtask.todoId, userId },
		});

		if (!todo) {
			return Response.json(
				{ error: "Todo not found or not authorized" },
				{ status: 404 },
			);
		}

		await subtaskRepo.delete(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json(
			{ error: "Failed to delete subtask" },
			{ status: 500 },
		);
	}
}
