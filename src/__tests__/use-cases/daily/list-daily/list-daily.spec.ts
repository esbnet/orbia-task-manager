import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";
import { ListDailyUseCase } from "@/application/use-cases/daily/list-daily/list-daily-use-case";

describe("ListDailyUseCase", () => {
	let useCase: ListDailyUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new ListDailyUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve retornar uma lista vazia quando não há dailies", async () => {
		const result = await useCase.execute();

		expect(result.daily).toEqual([]);
		expect(result.daily.length).toBe(0);
	});

	it("deve retornar uma lista de dailies quando existem dailies", async () => {
		// Criar alguns dailies para teste
		const dailyData1 = {
			title: "Daily de Teste 1",
			observations: "Observações de teste 1",
			tasks: ["Tarefa 1", "Tarefa 2"],
			difficulty: "Fácil" as const,
			startDate: new Date(),
			repeat: {
				type: "Diariamente" as const,
				frequency: 1,
			},
			tags: ["teste"],
			userId: "user-123",
			createdAt: new Date(),
		};

		const dailyData2 = {
			title: "Daily de Teste 2",
			observations: "Observações de teste 2",
			tasks: ["Tarefa 3", "Tarefa 4"],
			difficulty: "Médio" as const,
			startDate: new Date(),
			repeat: {
				type: "Semanalmente" as const,
				frequency: 2,
			},
			tags: ["teste", "importante"],
			userId: "user-456",
			createdAt: new Date(),
		};

		await dailyRepository.create(dailyData1);
		await dailyRepository.create(dailyData2);

		const result = await useCase.execute();

		expect(result.daily.length).toBe(2);
		expect(result.daily[0].title).toBe("Daily de Teste 1");
		expect(result.daily[0].difficulty).toBe("Fácil");
		expect(result.daily[1].title).toBe("Daily de Teste 2");
		expect(result.daily[1].difficulty).toBe("Médio");
	});

	it("deve retornar todos os dailies incluindo os dados de exemplo", async () => {
		// O repositório já vem com um daily de exemplo
		const result = await useCase.execute();

		expect(result.daily.length).toBeGreaterThan(0);
		expect(result.daily[0]).toBeDefined();
		expect(result.daily[0].title).toBeDefined();
		expect(result.daily[0].difficulty).toBeDefined();
	});
});