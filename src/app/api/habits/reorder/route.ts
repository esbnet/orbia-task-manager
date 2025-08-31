import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();

export async function PATCH(request: NextRequest) {
	try {
		const { ids } = await request.json();
		
		if (!Array.isArray(ids)) {
			return Response.json(
				{ error: "IDs must be an array" },
				{ status: 400 }
			);
		}

		await habitRepository.reorder(ids);
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error("Error reordering habits:", error);
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
