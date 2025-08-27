// import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
// import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";

// const dailyRepository = new PrismaDailyRepository();
// const dailyPeriodRepository = new PrismaDailyPeriodRepository();

export async function GET() {
	try {
		// Buscar dados diretamente do banco com lógica de períodos
		const { prisma } = await import("@/infra/database/prisma/prisma-client");

		const rawDailies = await prisma.daily.findMany({
			include: {
				subtasks: {
					orderBy: { order: "asc" },
				},
				periods: {
					orderBy: { createdAt: "desc" },
				},
			},
		});

		console.log('📊 Dailies encontradas no banco (raw):', rawDailies.length);

		if (rawDailies.length > 0) {
			const availableDailies = [];
			const completedToday = [];

			for (const daily of rawDailies) {
				// Buscar o período mais recente (primeiro na lista ordenada por createdAt desc)
				const latestPeriod = daily.periods[0];

				if (!latestPeriod) {
					// Sem períodos = disponível para completar
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
				} else {
					// Verificar se o período mais recente está completado
					if (latestPeriod.isCompleted) {
						// Verificar se ainda está no mesmo período (hoje)
						const now = new Date();
						const periodEnd = latestPeriod.endDate || new Date();


						if (now < periodEnd) {
							// Ainda no período atual = completada hoje
							const nextAvailableAt = calculateNextPeriodStart(daily.repeatType, periodEnd);

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
								currentPeriod: {
									id: latestPeriod.id,
									startDate: latestPeriod.startDate,
									endDate: latestPeriod.endDate,
									isCompleted: latestPeriod.isCompleted,
								},
							});
						} else {
							// Período expirou = disponível novamente
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
					} else {
						// Período não completado = disponível
						availableDailies.push({
							id: daily.id,
							title: daily.title,
							observations: daily.observations,
							difficulty: daily.difficulty,
							repeatType: daily.repeatType,
							repeatFrequency: daily.repeatFrequency,
							tags: daily.tags,
							isAvailable: true,
							currentPeriod: {
								id: latestPeriod.id,
								startDate: latestPeriod.startDate,
								endDate: latestPeriod.endDate,
								isCompleted: latestPeriod.isCompleted,
							},
						});
					}
				}
			}

			const result = {
				availableDailies,
				completedToday,
				totalDailies: rawDailies.length,
			};

			console.log('✅ Resultado com lógica de períodos:', {
				disponíveis: availableDailies.length,
				completadas: completedToday.length,
				total: rawDailies.length,
			});

			return Response.json(result);
		} else {
			// Fallback para dados mockados se banco estiver vazio
			console.log('⚠️ Banco vazio, usando dados mockados');
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
		console.error("Error getting available dailies:", error);
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
