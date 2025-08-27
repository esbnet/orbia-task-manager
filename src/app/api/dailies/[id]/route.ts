import type { NextRequest } from "next/server";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		
		// Buscar dados diretamente do banco
		const { prisma } = await import("@/infra/database/prisma/prisma-client");
		
		// Verificar se a daily existe
		const daily = await prisma.daily.findUnique({
			where: { id },
		});
		
		if (!daily) {
			return Response.json(
				{ error: "Daily não encontrada" },
				{ status: 404 }
			);
		}
		
		// Deletar períodos relacionados primeiro (devido às foreign keys)
		await prisma.dailyPeriod.deleteMany({
			where: { dailyId: id },
		});
		
		// Deletar logs relacionados
		await prisma.dailyLog.deleteMany({
			where: { dailyId: id },
		});
		
		// Deletar subtasks relacionadas
		await prisma.dailySubtask.deleteMany({
			where: { dailyId: id },
		});
		
		// Deletar a daily
		await prisma.daily.delete({
			where: { id },
		});
		
		console.log(`🗑️ Daily "${daily.title}" (${id}) deletada com sucesso`);
		
		return Response.json({
			success: true,
			message: `Daily "${daily.title}" removida com sucesso!`,
		}, { status: 200 });
		
	} catch (error) {
		console.error("Error deleting daily:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
