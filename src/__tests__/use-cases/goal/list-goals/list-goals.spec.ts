import { ListGoalsUseCase } from "@/application/use-cases/use-cases/goal/list-goals/list-goals-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("ListGoalsUseCase", () => {
	let useCase: ListGoalsUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new ListGoalsUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para ListGoalsUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
