import { ListDailySubtaskUseCase } from "@/application/use-cases/use-cases/daily-subtask/list-daily-subtask/list-daily-subtask-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("ListDailySubtaskUseCase", () => {
	let useCase: ListDailySubtaskUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new ListDailySubtaskUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para ListDailySubtaskUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
