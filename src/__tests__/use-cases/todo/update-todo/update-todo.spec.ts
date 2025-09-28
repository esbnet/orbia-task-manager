import { UpdateTodoUseCase } from "@/application/use-cases/use-cases/todo/update-todo/update-todo-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("UpdateTodoUseCase", () => {
	let useCase: UpdateTodoUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new UpdateTodoUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para UpdateTodoUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
