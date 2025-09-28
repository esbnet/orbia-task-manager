import { ListTodoSubtaskUseCase } from "@/application/use-cases/use-cases/todo-subtask/list-todo-subtask/list-todo-subtask-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("ListTodoSubtaskUseCase", () => {
	let useCase: ListTodoSubtaskUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new ListTodoSubtaskUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para ListTodoSubtaskUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
