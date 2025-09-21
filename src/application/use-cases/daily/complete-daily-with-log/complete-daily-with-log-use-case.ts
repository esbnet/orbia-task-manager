import type { Daily } from "@/domain/entities/daily";
import type {
	DailyLogRepository,
	DailyRepository,
} from "@/domain/repositories/all-repository";

export interface CompleteDailyWithLogInput {
	daily: Daily;
}

export interface CompleteDailyWithLogOutput {
	success: boolean;
	updatedDaily: Daily;
}

export class CompleteDailyWithLogUseCase {
	constructor(
		private dailyRepository: DailyRepository,
		private dailyLogRepository: DailyLogRepository,
	) {}

	async execute(
		input: CompleteDailyWithLogInput,
	): Promise<CompleteDailyWithLogOutput> {
		// Create log
		await this.dailyLogRepository.create({
			dailyId: input.daily.id,
			dailyTitle: input.daily.title,
			difficulty: input.daily.difficulty,
			tags: input.daily.tags,
			completedAt: new Date(),
		});

		// Update daily with completion date
		const today = new Date().toISOString().split("T")[0];
		const updatedDaily = { ...input.daily, lastCompletedDate: today };
		const result = await this.dailyRepository.update(updatedDaily);

		return {
			success: true,
			updatedDaily: result,
		};
	}
}
