import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const habit = await habitRepository.findById(id);

		if (!habit) {
			return Response.json({ error: "Habit not found" }, { status: 404 });
		}

		return Response.json({ habit });
	} catch (error) {
		console.error("Error fetching habit:", error);
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await habitRepository.delete(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting habit:", error);
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
