import { CompleteDailyWithLogUseCase } from "@/application/use-cases/use-cases/daily/complete-daily-with-log/complete-daily-with-log-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("CompleteDailyWithLogUseCase", () => {
	let useCase: CompleteDailyWithLogUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new CompleteDailyWithLogUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para CompleteDailyWithLogUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
