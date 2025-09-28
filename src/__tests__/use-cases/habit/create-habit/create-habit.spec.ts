import { CreateHabitUseCase } from "@/application/use-cases/use-cases/habit/create-habit/create-habit-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("CreateHabitUseCase", () => {
	let useCase: CreateHabitUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new CreateHabitUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para CreateHabitUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
