import { CompleteHabitUseCase } from "@/application/use-cases/use-cases/habit/complete-habit/complete-habit-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("CompleteHabitUseCase", () => {
	let useCase: CompleteHabitUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new CompleteHabitUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para CompleteHabitUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
