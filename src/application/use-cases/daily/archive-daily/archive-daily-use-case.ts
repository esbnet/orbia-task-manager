import type { DailyRepository } from "@/domain/repositories/all-repository";

export class ArchiveDailyUseCase {
	constructor(private dailyRepository: DailyRepository) {}

	async execute(id: string): Promise<void> {
		const daily = await this.dailyRepository.findById(id);
		if (!daily) throw new Error("Daily not found");

		await this.dailyRepository.update({ ...daily, status: "archived" });
	}
}
