import type { CreateDailyInput } from "@/application/use-cases/daily/create-daily/create-daily-dto";
import { CreateDailyUseCase } from "@/application/use-cases/daily/create-daily/create-daily-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("CreateDailyUseCase", () => {
	let useCase: CreateDailyUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new CreateDailyUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve criar um daily com sucesso", async () => {
		const inputDaily: Omit<CreateDailyInput, "id"> = {
			userId: "test-user-123",
			title: "Daily de Teste",
			observations: "Observações de teste",
			difficulty: "Fácil",
			startDate: new Date(),
			tags: ["Tag 1", "Tag 2"],
			createdAt: new Date(),
		};

		const result = await useCase.execute(inputDaily);

		expect(result.daily).toBeDefined();
		expect(result.daily.title).toBe(inputDaily.title);
		expect(result.daily.observations).toBe("Observações de teste");
		expect(result.daily.taskList).toEqual([]);
		expect(result.daily.difficulty).toBe("Fácil");
		expect(result.daily.repeat?.type).toBe("Diariamente");
		expect(result.daily.repeat?.frequency).toBe(1);
		expect(result.daily.tags).toEqual([]);
	});

	it("deve criar um daily com dificuldade padrão quando não especificada", async () => {
		const inputDaily: Omit<CreateDailyInput, "id"> = {
			userId: "test-user-456",
			title: "Daily sem dificuldade",
			observations: "Teste",
			difficulty: "Fácil",
			startDate: new Date(),
			tags: [],
			createdAt: new Date(),
		};

		const result = await useCase.execute(inputDaily);

		expect(result.daily).toBeDefined();
		expect(result.daily.difficulty).toBe("Fácil");
	});

	it("deve criar um daily com repeat padrão quando não especificado", async () => {
		const inputDaily: Omit<CreateDailyInput, "id"> = {
			userId: "test-user-789",
			title: "Daily sem repeat",
			observations: "Teste",
			difficulty: "Médio",
			startDate: new Date(),
			tags: [],
			createdAt: new Date(),
		};

		const result = await useCase.execute(inputDaily);

		expect(result.daily).toBeDefined();
		expect(result.daily.repeat?.type).toBe("Diariamente");
		expect(result.daily.repeat?.frequency).toBe(1);
	});
});