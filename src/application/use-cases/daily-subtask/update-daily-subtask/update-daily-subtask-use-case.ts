import type { DailySubtask } from "@/domain/entities/daily-subtask";
import type { DailySubtaskRepository } from "@/domain/repositories/all-repository";

export interface UpdateDailySubtaskInput {
	subtask: DailySubtask;
}

export interface UpdateDailySubtaskOutput {
	subtask: DailySubtask;
}

export class UpdateDailySubtaskUseCase {
	constructor(private dailySubtaskRepository: DailySubtaskRepository) {}

	async execute(
		input: UpdateDailySubtaskInput,
	): Promise<UpdateDailySubtaskOutput> {
		const subtask = await this.dailySubtaskRepository.update(input.subtask);
		return { subtask };
	}
}
