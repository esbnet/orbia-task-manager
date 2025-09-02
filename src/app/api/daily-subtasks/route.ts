import { PrismaDailySubtaskRepository } from "@/infra/database/prisma/prisma-daily-subtask-repository";
import type { NextRequest } from "next/server";

const subtaskRepo = new PrismaDailySubtaskRepository();

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const dailyId = searchParams.get("dailyId");

	if (dailyId) {
		const subtasks = await subtaskRepo.listByDailyId(dailyId);
		return Response.json({ subtasks });
	}

	const subtasks = await subtaskRepo.list();
	return Response.json({ subtasks });
}

export async function POST(request: NextRequest) {
	try {
		const { title, dailyId, order } = await request.json();
		const subtask = await subtaskRepo.create({
			title,
			completed: false,
			dailyId,
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
	const { subtask } = await request.json();
	const updated = await subtaskRepo.update(subtask);
	return Response.json({ subtask: updated });
}

export async function DELETE(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	await subtaskRepo.delete(id);
	return new Response(null, { status: 204 });
}
