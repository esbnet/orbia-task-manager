import { CompleteTodoWithLogUseCase } from "@/application/use-cases/use-cases/todo/complete-todo-with-log/complete-todo-with-log-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("CompleteTodoWithLogUseCase", () => {
	let useCase: CompleteTodoWithLogUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new CompleteTodoWithLogUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para CompleteTodoWithLogUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
