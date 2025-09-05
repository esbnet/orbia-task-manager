import type { Goal } from "@/domain/entities/goal";
import type { GoalRepository } from "@/domain/repositories/goal-repository";
import type { UpdateGoalDto } from "./update-goal-dto";

export class UpdateGoalUseCase {
	constructor(private goalRepository: GoalRepository) {}

	async execute(dto: UpdateGoalDto): Promise<Goal> {
		// Primeiro, buscar a meta atual
		const currentGoal = await this.goalRepository.findById(dto.id);
		if (!currentGoal) {
			throw new Error("Meta não encontrada");
		}

		// Preparar os dados para atualização
		const updateData: Partial<Goal> = {
			...currentGoal,
		};

		if (dto.title !== undefined) updateData.title = dto.title;
		if (dto.description !== undefined) updateData.description = dto.description;
		if (dto.targetDate !== undefined) updateData.targetDate = dto.targetDate;
		if (dto.priority !== undefined) updateData.priority = dto.priority;
		if (dto.tags !== undefined) updateData.tags = dto.tags;

		// Atualizar a meta
		const updatedGoal = await this.goalRepository.update(updateData as Goal);

		// Atualizar tarefas anexadas se fornecidas
		if (dto.attachedTasks !== undefined) {
			await this.goalRepository.updateAttachedTasks(dto.id, dto.attachedTasks);
		}

		return updatedGoal;
	}
}