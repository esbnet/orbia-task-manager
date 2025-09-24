import { DeleteTodoUseCase } from "@/application/use-cases/use-cases/todo/delete-todo/delete-todo-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("DeleteTodoUseCase", () => {
	let useCase: DeleteTodoUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new DeleteTodoUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para DeleteTodoUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
