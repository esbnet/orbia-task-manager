import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { NextResponse } from "next/server";

const habitRepository = new PrismaHabitRepository();

export async function GET() {
	try {
		const tagStats = await habitRepository.getTagStats();

		return NextResponse.json({ tagStats });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}