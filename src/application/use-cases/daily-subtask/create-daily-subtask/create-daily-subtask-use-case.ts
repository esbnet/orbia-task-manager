import type { DailySubtask } from "@/domain/entities/daily-subtask";
import type { DailySubtaskRepository } from "@/domain/repositories/all-repository";

export interface CreateDailySubtaskInput {
	title: string;
	dailyId: string;
	order: number;
}

export interface CreateDailySubtaskOutput {
	subtask: DailySubtask;
}

export class CreateDailySubtaskUseCase {
	constructor(private dailySubtaskRepository: DailySubtaskRepository) {}

	async execute(
		input: CreateDailySubtaskInput,
	): Promise<CreateDailySubtaskOutput> {
		const subtask = await this.dailySubtaskRepository.create({
			title: input.title,
			completed: false,
			dailyId: input.dailyId,
			order: input.order,
		});

		return { subtask };
	}
}
