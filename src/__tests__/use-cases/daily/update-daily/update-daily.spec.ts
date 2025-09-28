import { UpdateDailyUseCase } from "@/application/use-cases/use-cases/daily/update-daily/update-daily-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("UpdateDailyUseCase", () => {
	let useCase: UpdateDailyUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new UpdateDailyUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para UpdateDailyUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
