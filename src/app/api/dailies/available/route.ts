// import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
// import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";

// const dailyRepository = new PrismaDailyRepository();
// const dailyPeriodRepository = new PrismaDailyPeriodRepository();

export async function GET() {
	try {
		// Buscar dados diretamente do banco com lógica de períodos
		const { prisma } = await import("@/infra/database/prisma/prisma-client");
		const { getCurrentUserIdWithFallback } = await import("@/hooks/use-current-user");

		const userId = await getCurrentUserIdWithFallback();

		if (!userId) {
			return Response.json({
				availableDailies: [],
				completedToday: [],
				totalDailies: 0,
			});
		}

		const rawDailies = await prisma.daily.findMany({
			where: { userId },
			include: {
				subtasks: {
					orderBy: { order: "asc" },
				},
				logs: {
					orderBy: { completedAt: "desc" },
				},
			},
		});


		if (rawDailies.length > 0) {
			const availableDailies = [];
			const completedToday = [];

			for (const daily of rawDailies) {
				// Verificar se existe log de conclusão hoje
				const today = new Date().toISOString().split('T')[0];
				const hasLogToday = daily.logs.some(log => {
					const logDate = new Date(log.completedAt).toISOString().split('T')[0];
					return logDate === today;
				});

				if (hasLogToday) {
					// Tem log hoje = completada hoje
					const nextAvailableAt = calculateNextPeriodStart(daily.repeatType, new Date());
					completedToday.push({
						id: daily.id,
						title: daily.title,
						observations: daily.observations,
						difficulty: daily.difficulty,
						repeatType: daily.repeatType,
						repeatFrequency: daily.repeatFrequency,
						tags: daily.tags,
						isAvailable: false,
						nextAvailableAt,
					});
				} else {
					// Não tem log hoje = disponível
					availableDailies.push({
						id: daily.id,
						title: daily.title,
						observations: daily.observations,
						difficulty: daily.difficulty,
						repeatType: daily.repeatType,
						repeatFrequency: daily.repeatFrequency,
						tags: daily.tags,
						isAvailable: true,
					});
				}
			}

			const result = {
				availableDailies,
				completedToday,
				totalDailies: rawDailies.length,
				"disponíveis": availableDailies.length,
				"completadas": completedToday.length,
				total: rawDailies.length,
			};

			return Response.json(result);
		} else {
			// Fallback para dados mockados se banco estiver vazio
			const result = {
				availableDailies: [
					{
						id: "mock-1",
						title: "Exercitar-se (Mock)",
						observations: "30 minutos de exercício",
						difficulty: "Médio",
						repeatType: "Diariamente",
						repeatFrequency: 1,
						tags: ["saúde", "exercício"],
						isAvailable: true,
					},
					{
						id: "mock-2",
						title: "Ler livro (Mock)",
						observations: "Ler pelo menos 20 páginas",
						difficulty: "Fácil",
						repeatType: "Diariamente",
						repeatFrequency: 1,
						tags: ["leitura", "conhecimento"],
						isAvailable: true,
					}
				],
				completedToday: [],
				totalDailies: 2,
			};

			return Response.json(result);
		}
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
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
