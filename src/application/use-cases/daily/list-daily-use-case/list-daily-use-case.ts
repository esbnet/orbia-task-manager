import type { Daily } from "@/domain/entities/daily";
import type { DailyRepository } from "@/domain/repositories/all-repository";

export interface ListDailyOutput {
	daily: Daily[];
}

export class ListDailyUseCase {
	constructor(private dailyRepository: DailyRepository) {}

	async execute(): Promise<ListDailyOutput> {
		const daily = await this.dailyRepository.list();
		return { daily };
	}
}
