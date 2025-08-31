import type { Goal } from "@/domain/entities/goal";
import type { GoalRepository } from "@/domain/repositories/goal-repository";
import type { ListGoalsDto } from "./list-goals-dto";

export class ListGoalsUseCase {
	constructor(private goalRepository: GoalRepository) {}

	async execute(dto: ListGoalsDto): Promise<Goal[]> {
		let goals: Goal[] = [];

		if (dto.status) {
			goals = await this.goalRepository.findByStatus(
				dto.status,
			);
		} else if (dto.priority) {
			goals = await this.goalRepository.findByPriority(
				dto.priority,
			);
		} else if (dto.category) {
			goals = await this.goalRepository.findByCategory(
				dto.category,
			);
		} else if (dto.tags && dto.tags.length > 0) {
			goals = await this.goalRepository.findByTags(dto.tags);
		} else if (dto.includeDueSoon) {
			goals = await this.goalRepository.findDueSoon(
				dto.dueSoonDays || 7,
			);
		} else {
			goals = await this.goalRepository.findByUserId(dto.userId);
		}

		return goals;
	}
}
