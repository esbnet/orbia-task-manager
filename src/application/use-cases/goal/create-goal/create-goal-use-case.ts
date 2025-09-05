import type { Goal } from "@/domain/entities/goal";
import type { GoalRepository } from "@/domain/repositories/goal-repository";
import type { CreateGoalDto } from "./create-goal-dto";

export class CreateGoalUseCase {
	constructor(private goalRepository: GoalRepository) {}

	async execute(dto: CreateGoalDto): Promise<Goal> {
		const goal: Omit<Goal, "id" | "createdAt" | "updatedAt"> = {
			title: dto.title,
			description: dto.description || "",
			targetDate: dto.targetDate,
			status: "IN_PROGRESS",
			priority: dto.priority || "MEDIUM",
			tags: dto.tags || [],
			userId: dto.userId,
		};

		const createdGoal = await this.goalRepository.create(goal);

		// Anexar tarefas se fornecidas
		if (dto.attachedTasks && dto.attachedTasks.length > 0) {
			await this.goalRepository.updateAttachedTasks(createdGoal.id, dto.attachedTasks);
		}

		return createdGoal;
	}
}
