import { HabitModule } from "@/modules/habit";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const tagStats = await HabitModule.getTagStats();
		return NextResponse.json({ tagStats });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}