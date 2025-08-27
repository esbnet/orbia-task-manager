import type { DailyRepository } from "@/domain/repositories/all-repository";
import type { DailyOutput } from "./list-daily-dto";

export class ToggleCompleteUseCase {
	constructor(private readonly dailyRepository: DailyRepository) {}

	async execute(id: string): Promise<DailyOutput> {
		const daily = await this.dailyRepository.toggleComplete(id);

		return { daily };
	}
}
