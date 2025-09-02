import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const tagsParam = searchParams.get("tags");
		
		if (!tagsParam) {
			return Response.json(
				{ error: "Tags parameter is required" },
				{ status: 400 }
			);
		}

		const tags = tagsParam.split(",").map(tag => tag.trim());
		const habits = await habitRepository.findByTags(tags);
		
		return Response.json({ habits });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
