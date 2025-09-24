import { CompleteTodoUseCase } from "@/application/use-cases/use-cases/todo/complete-todo/complete-todo-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("CompleteTodoUseCase", () => {
	let useCase: CompleteTodoUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new CompleteTodoUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para CompleteTodoUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
