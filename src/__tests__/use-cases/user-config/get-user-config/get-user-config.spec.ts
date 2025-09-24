import { GetUserConfigUseCase } from "@/application/use-cases/use-cases/user-config/get-user-config/get-user-config-use-case";
import { InMemoryDailyRepository } from "@/infra/repositories/memory/in-memory-daily-repository";

describe("GetUserConfigUseCase", () => {
	let useCase: GetUserConfigUseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new GetUserConfigUseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para GetUserConfigUseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
