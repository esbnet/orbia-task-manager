import type { DailySubtaskRepository } from "@/domain/repositories/all-repository";

export interface DeleteDailySubtaskInput {
	id: string;
}

export interface DeleteDailySubtaskOutput {
	success: boolean;
}

export class DeleteDailySubtaskUseCase {
	constructor(private dailySubtaskRepository: DailySubtaskRepository) {}

	async execute(
		input: DeleteDailySubtaskInput,
	): Promise<DeleteDailySubtaskOutput> {
		await this.dailySubtaskRepository.delete(input.id);
		return { success: true };
	}
}
