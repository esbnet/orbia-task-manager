import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily/delete-daily-use-case";
import { container } from "@/infra/di/container";
import type { NextRequest } from "next/server";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		
		const deleteDailyUseCase = new DeleteDailyUseCase(
			container.getDailyRepository()
		);
		
		const result = await deleteDailyUseCase.execute(id);
		
		return Response.json({
			success: true,
			message: "Daily deletado com sucesso",
		}, { status: 200 });
		
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
