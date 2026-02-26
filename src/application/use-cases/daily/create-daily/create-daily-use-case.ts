import type {
	CreateDailyInput,
	CreateDailyOutput,
	DailyDifficulty,
} from "./create-daily-dto";

import type { DailyRepository } from "@/domain/repositories/all-repository";

export class CreateDailyUseCase {
	constructor(private readonly dailyRepository: DailyRepository) {}

	async execute(
		inputDaily: Omit<CreateDailyInput, "id">,
	): Promise<CreateDailyOutput> {
		const daily = await this.dailyRepository.create({
			userId: inputDaily.userId,
			title: inputDaily.title,
			observations: inputDaily.observations || "",
			tasks: inputDaily.tasks || [],
			difficulty: (inputDaily.difficulty as DailyDifficulty) ?? "Fácil",
			startDate: inputDaily.startDate || new Date(),
			repeat: inputDaily.repeat || {
				type: "Diariamente",
				frequency: 1,
			},
			tags: inputDaily.tags || [],
			lastCompletedDate: undefined,
		});

		return {
			daily,
		};
	}
}
