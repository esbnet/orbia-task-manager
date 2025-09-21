import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";

const habitRepository = new PrismaHabitRepository();

export async function GET() {
	try {
		const tagStats = await habitRepository.getTagStats();

		return Response.json({ tagStats });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}