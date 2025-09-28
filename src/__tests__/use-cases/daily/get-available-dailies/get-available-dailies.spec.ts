import { GetAvailableDailiesUseCase } from "@/application/use-cases/use-cases/daily/get-available-dailies/get-available-dailies-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("GetAvailableDailiesUseCase", () => {
	let useCase: GetAvailableDailiesUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new GetAvailableDailiesUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para GetAvailableDailiesUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
