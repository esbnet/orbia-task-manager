import type { NextRequest } from "next/server";

export async function POST(
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

		// Buscar período ativo para esta daily
		let activePeriod = await prisma.dailyPeriod.findFirst({
			where: {
				dailyId: id,
				isActive: true,
			},
		});

		// Se não há período ativo, criar um novo
		if (!activePeriod) {
			const now = new Date();
			const endDate = calculatePeriodEnd(daily.repeatType, now);

			activePeriod = await prisma.dailyPeriod.create({
				data: {
					dailyId: id,
					periodType: daily.repeatType,
					startDate: now,
					endDate,
					isCompleted: false,
					isActive: true,
				},
			});
		}

		// Verificar se já foi completada neste período
		if (activePeriod.isCompleted) {
			return Response.json(
				{ error: "Daily já foi completada neste período" },
				{ status: 400 }
			);
		}

		// Marcar como completada e finalizar período
		// Manter a endDate original calculada, não sobrescrever com new Date()
		const completedPeriod = await prisma.dailyPeriod.update({
			where: { id: activePeriod.id },
			data: {
				isCompleted: true,
				isActive: false,
				// Não alterar endDate - manter a data de fim do período original
			},
		});

		// Criar log da conclusão
		await prisma.dailyLog.create({
			data: {
				dailyId: id,
				periodId: completedPeriod.id,
				dailyTitle: daily.title,
				difficulty: daily.difficulty,
				tags: daily.tags,
			},
		});

		// Calcular próximo período
		const nextPeriodStart = calculateNextPeriodStart(daily.repeatType, completedPeriod.endDate!);


		return Response.json({
			success: true,
			message: `Daily "${daily.title}" completada com sucesso!`,
			periodId: completedPeriod.id,
			nextAvailableAt: nextPeriodStart,
		}, { status: 201 });

	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}

function calculatePeriodEnd(repeatType: string, startDate: Date): Date {
	const endDate = new Date(startDate);

	switch (repeatType) {
		case "Diariamente":
			// Para dailies, o período termina no final do mesmo dia
			endDate.setHours(23, 59, 59, 999);
			break;
		case "Semanalmente":
			endDate.setDate(endDate.getDate() + 6);
			endDate.setHours(23, 59, 59, 999);
			break;
		case "Mensalmente":
			endDate.setMonth(endDate.getMonth() + 1);
			endDate.setDate(0); // Último dia do mês
			endDate.setHours(23, 59, 59, 999);
			break;
		default:
			endDate.setHours(23, 59, 59, 999);
	}

	return endDate;
}

function calculateNextPeriodStart(repeatType: string, completedAt: Date): Date {
	const nextStart = new Date(completedAt);

	switch (repeatType) {
		case "Diariamente":
			nextStart.setDate(nextStart.getDate() + 1);
			nextStart.setHours(0, 0, 0, 0);
			break;
		case "Semanalmente":
			nextStart.setDate(nextStart.getDate() + 7);
			break;
		case "Mensalmente":
			nextStart.setMonth(nextStart.getMonth() + 1);
			break;
		default:
			nextStart.setDate(nextStart.getDate() + 1);
	}

	return nextStart;
}
