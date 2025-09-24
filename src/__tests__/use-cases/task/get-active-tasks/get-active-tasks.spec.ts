import { GetActiveTasksUseCase } from "@/application/use-cases/use-cases/task/get-active-tasks/get-active-tasks-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("GetActiveTasksUseCase", () => {
	let useCase: GetActiveTasksUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new GetActiveTasksUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para GetActiveTasksUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
