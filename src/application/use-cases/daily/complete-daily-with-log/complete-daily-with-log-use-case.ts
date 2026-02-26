import type { Daily } from "@/domain/entities/daily";
import type {
	DailyLogRepository,
	DailyRepository,
	DailyPeriodRepository,
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
		private dailyPeriodRepository: DailyPeriodRepository,
	) {}

	async execute(
		input: CompleteDailyWithLogInput,
	): Promise<CompleteDailyWithLogOutput> {
		const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(input.daily.id);

		await this.dailyLogRepository.create({
			dailyId: input.daily.id,
			periodId: activePeriod?.id,
			dailyTitle: input.daily.title,
			difficulty: input.daily.difficulty,
			tags: input.daily.tags,
			status: "success",
			completedAt: new Date(),
		});

		if (activePeriod) {
			await this.dailyPeriodRepository.completeAndFinalize(activePeriod.id);
		}

		const today = new Date().toISOString().split("T")[0];
		const updatedDaily = { ...input.daily, lastCompletedDate: today };
		const result = await this.dailyRepository.update(updatedDaily);

		return {
			success: true,
			updatedDaily: result,
		};
	}
}
