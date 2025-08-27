import type { DailyRepository } from "@/domain/repositories/all-repository";
import type { ListDailyOutput } from "./list-daily-dto";

export class ListDailyUseCase {
	constructor(private readonly dailyRepository: DailyRepository) {}

	async execute(): Promise<ListDailyOutput> {
		const daily = await this.dailyRepository.list();

		return { daily } as ListDailyOutput;
	}
}
