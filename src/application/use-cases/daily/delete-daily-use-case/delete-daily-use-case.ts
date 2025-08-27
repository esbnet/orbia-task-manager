import type { DailyRepository } from "@/domain/repositories/all-repository";

export interface DeleteDailyInput {
	id: string;
}

export interface DeleteDailyOutput {
	success: boolean;
}

export class DeleteDailyUseCase {
	constructor(private dailyRepository: DailyRepository) {}

	async execute(input: DeleteDailyInput): Promise<DeleteDailyOutput> {
		await this.dailyRepository.delete(input.id);
		return { success: true };
	}
}
