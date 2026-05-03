import { HabitModule } from "@/modules/habit";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		await HabitModule.cleanupPeriods();
		return NextResponse.json({
			success: true,
			message: "Períodos expirados finalizados com sucesso",
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}