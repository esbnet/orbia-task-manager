import { ToggleTodoUseCase } from "@/application/use-cases/use-cases/todo/toggle-todo/toggle-todo-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("ToggleTodoUseCase", () => {
	let useCase: ToggleTodoUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new ToggleTodoUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para ToggleTodoUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
