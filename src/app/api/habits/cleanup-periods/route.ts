import { HabitPeriodManager } from "@/domain/services/habit-period-manager";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { NextResponse } from "next/server";

const habitPeriodRepository = new PrismaHabitPeriodRepository();
const periodManager = new HabitPeriodManager(habitPeriodRepository);

export async function POST() {
	try {
		await periodManager.finalizeExpiredPeriods();
		
		return NextResponse.json({ 
			success: true, 
			message: "Períodos expirados finalizados com sucesso" 
		});
	} catch (error) {
		console.error("Erro ao finalizar períodos expirados:", error);
		
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}