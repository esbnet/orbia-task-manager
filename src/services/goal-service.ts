import type { Goal } from "@/domain/entities/goal";
import type { GoalRepository } from "@/domain/repositories/goal-repository";
import { BaseEntityService, handleServiceError } from "./base/entity-service";

// Goal form data interface
export interface GoalFormData {
	title: string;
	description: string;
	targetDate: Date;
	priority: Goal["priority"];
	category: Goal["category"];
	tags: string[];
}

// Goal service implementation
export class GoalService extends BaseEntityService<Goal, GoalFormData> {
	constructor(repository: GoalRepository) {
		super(repository);
	}

	protected mapFormDataToEntity(data: GoalFormData): Omit<Goal, "id" | "createdAt" | "updatedAt"> {
		return {
			title: data.title,
			description: data.description,
			targetDate: data.targetDate,
			status: "IN_PROGRESS", // Default status
			priority: data.priority,
			category: data.category,
			tags: data.tags,
			userId: "", // Will be set by repository
		};
	}

	// Goal-specific methods
	async findByStatus(userId: string, status: Goal["status"]): Promise<Goal[]> {
		try {
			const goalRepo = this.repository as GoalRepository;
			return await goalRepo.findByStatus(userId, status);
		} catch (error) {
			return handleServiceError(error, "buscar goals por status");
		}
	}

	async findByPriority(userId: string, priority: Goal["priority"]): Promise<Goal[]> {
		try {
			const goalRepo = this.repository as GoalRepository;
			return await goalRepo.findByPriority(userId, priority);
		} catch (error) {
			return handleServiceError(error, "buscar goals por prioridade");
		}
	}

	async findByCategory(userId: string, category: Goal["category"]): Promise<Goal[]> {
		try {
			const goalRepo = this.repository as GoalRepository;
			return await goalRepo.findByCategory(userId, category);
		} catch (error) {
			return handleServiceError(error, "buscar goals por categoria");
		}
	}

	async findOverdue(userId: string): Promise<Goal[]> {
		try {
			const goalRepo = this.repository as GoalRepository;
			return await goalRepo.findOverdue(userId);
		} catch (error) {
			return handleServiceError(error, "buscar goals em atraso");
		}
	}

	async findDueSoon(userId: string, days: number = 7): Promise<Goal[]> {
		try {
			const goalRepo = this.repository as GoalRepository;
			return await goalRepo.findDueSoon(userId, days);
		} catch (error) {
			return handleServiceError(error, "buscar goals próximos do vencimento");
		}
	}

	async updateStatus(id: string, status: Goal["status"]): Promise<Goal> {
		try {
			return await this.update(id, { status });
		} catch (error) {
			return handleServiceError(error, "atualizar status do goal");
		}
	}
}
