import { DeleteDailyUseCase } from "@/application/use-cases/use-cases/daily/delete-daily/delete-daily-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("DeleteDailyUseCase", () => {
	let useCase: DeleteDailyUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new DeleteDailyUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para DeleteDailyUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
