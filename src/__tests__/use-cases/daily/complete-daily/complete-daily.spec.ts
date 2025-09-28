import { CompleteDailyUseCase } from "@/application/use-cases/daily/complete-daily/complete-daily-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("CompleteDailyUseCase", () => {
	let useCase: CompleteDailyUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new CompleteDailyUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para CompleteDailyUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
