import { UpdateTodoSubtaskUseCase } from "@/application/use-cases/use-cases/todo-subtask/update-todo-subtask/update-todo-subtask-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("UpdateTodoSubtaskUseCase", () => {
	let useCase: UpdateTodoSubtaskUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new UpdateTodoSubtaskUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para UpdateTodoSubtaskUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
