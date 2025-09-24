import { DeleteTodoSubtaskUseCase } from "@/application/use-cases/use-cases/todo-subtask/delete-todo-subtask/delete-todo-subtask-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("DeleteTodoSubtaskUseCase", () => {
	let useCase: DeleteTodoSubtaskUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new DeleteTodoSubtaskUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para DeleteTodoSubtaskUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
