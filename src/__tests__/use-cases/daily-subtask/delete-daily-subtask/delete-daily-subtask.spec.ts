import { DeleteDailySubtaskUseCase } from "@/application/use-cases/use-cases/daily-subtask/delete-daily-subtask/delete-daily-subtask-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("DeleteDailySubtaskUseCase", () => {
	let useCase: DeleteDailySubtaskUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new DeleteDailySubtaskUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para DeleteDailySubtaskUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
