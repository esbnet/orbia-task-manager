import type { Daily } from "@/domain/entities/daily";
import type { DailyLog } from "@/domain/entities/daily-log";
import type { DailyRepository, DailyLogRepository } from "@/domain/repositories/all-repository";
import { BaseEntityService, handleServiceError } from "./base/entity-service";

// Daily form data interface
export interface DailyFormData {
	title: string;
	observations: string;
	tasks: string[];
	difficulty: Daily["difficulty"];
	startDate: Date;
	repeat: {
		type: Daily["repeat"]["type"];
		frequency: number;
	};
	tags: string[];
}

// Daily service implementation
export class DailyService extends BaseEntityService<Daily, DailyFormData> {
	constructor(
		repository: DailyRepository,
		private dailyLogRepository?: DailyLogRepository
	) {
		super(repository);
	}

	protected mapFormDataToEntity(data: DailyFormData): Omit<Daily, "id" | "createdAt" | "updatedAt"> {
		return {
			title: data.title,
			observations: data.observations,
			tasks: data.tasks,
			difficulty: data.difficulty,
			startDate: data.startDate,
			repeat: data.repeat,
			tags: data.tags,
			userId: "", // Will be set by repository
			order: 0, // Will be set by repository
			completed: false,
			lastCompletedDate: undefined,
		};
	}

	// Daily-specific methods
	async completeDaily(dailyId: string): Promise<{ daily: Daily; log?: DailyLog }> {
		try {
			// Get current daily
			const dailies = await this.repository.list();
			const daily = dailies.find((d) => d.id === dailyId);
			if (!daily) {
				throw new Error("Daily not found");
			}

			// Mark as completed
			const completedDaily = await this.update(dailyId, { 
				completed: true,
				lastCompletedDate: new Date().toISOString().split("T")[0]
			});

			// Create log if repository is available
			let log: DailyLog | undefined;
			if (this.dailyLogRepository) {
				log = await this.dailyLogRepository.create({
					dailyId: daily.id,
					dailyTitle: daily.title,
					difficulty: daily.difficulty,
					tags: daily.tags,
					completedAt: new Date(),
				});
			}

			return { daily: completedDaily, log };
		} catch (error) {
			return handleServiceError(error, "completar daily");
		}
	}

	async toggleComplete(dailyId: string): Promise<Daily> {
		try {
			const dailyRepo = this.repository as DailyRepository;
			return await dailyRepo.toggleComplete(dailyId);
		} catch (error) {
			return handleServiceError(error, "alternar status do daily");
		}
	}

	async findByDifficulty(difficulty: Daily["difficulty"]): Promise<Daily[]> {
		try {
			const dailies = await this.repository.list();
			return dailies.filter((daily) => daily.difficulty === difficulty);
		} catch (error) {
			return handleServiceError(error, "buscar dailies por dificuldade");
		}
	}

	async findByRepeatType(repeatType: Daily["repeat"]["type"]): Promise<Daily[]> {
		try {
			const dailies = await this.repository.list();
			return dailies.filter((daily) => daily.repeat.type === repeatType);
		} catch (error) {
			return handleServiceError(error, "buscar dailies por tipo de repetição");
		}
	}

	async findByTags(tags: string[]): Promise<Daily[]> {
		try {
			const dailyRepo = this.repository as DailyRepository;
			return await dailyRepo.findByTags(tags);
		} catch (error) {
			return handleServiceError(error, "buscar dailies por tags");
		}
	}

	async findCompleted(): Promise<Daily[]> {
		try {
			const dailies = await this.repository.list();
			return dailies.filter((daily) => daily.completed);
		} catch (error) {
			return handleServiceError(error, "buscar dailies concluídos");
		}
	}

	async findPending(): Promise<Daily[]> {
		try {
			const dailies = await this.repository.list();
			return dailies.filter((daily) => !daily.completed);
		} catch (error) {
			return handleServiceError(error, "buscar dailies pendentes");
		}
	}

	async findDueToday(): Promise<Daily[]> {
		try {
			const dailies = await this.repository.list();
			const today = new Date().toISOString().split("T")[0];
			
			return dailies.filter((daily) => {
				if (daily.completed && daily.lastCompletedDate === today) {
					return false; // Already completed today
				}

				// Check if daily should be shown today based on repeat settings
				return this.shouldShowToday(daily);
			});
		} catch (error) {
			return handleServiceError(error, "buscar dailies para hoje");
		}
	}

	async reorderDailies(dailyIds: string[]): Promise<void> {
		try {
			const dailyRepo = this.repository as DailyRepository;
			await dailyRepo.reorder(dailyIds);
		} catch (error) {
			return handleServiceError(error, "reordenar dailies");
		}
	}

	async addTask(dailyId: string, task: string): Promise<Daily> {
		try {
			const dailies = await this.repository.list();
			const daily = dailies.find((d) => d.id === dailyId);
			if (!daily) {
				throw new Error("Daily not found");
			}

			const updatedTasks = [...daily.tasks, task];
			return await this.update(dailyId, { tasks: updatedTasks });
		} catch (error) {
			return handleServiceError(error, "adicionar tarefa ao daily");
		}
	}

	async removeTask(dailyId: string, taskIndex: number): Promise<Daily> {
		try {
			const dailies = await this.repository.list();
			const daily = dailies.find((d) => d.id === dailyId);
			if (!daily) {
				throw new Error("Daily not found");
			}

			const updatedTasks = daily.tasks.filter((_, index) => index !== taskIndex);
			return await this.update(dailyId, { tasks: updatedTasks });
		} catch (error) {
			return handleServiceError(error, "remover tarefa do daily");
		}
	}

	// Helper method to determine if daily should be shown today
	private shouldShowToday(daily: Daily): boolean {
		const today = new Date();
		const startDate = new Date(daily.startDate);
		
		// If start date is in the future, don't show
		if (startDate > today) {
			return false;
		}

		const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

		switch (daily.repeat.type) {
			case "Diariamente":
				return daysDiff % daily.repeat.frequency === 0;
			case "Semanalmente":
				return daysDiff % (daily.repeat.frequency * 7) === 0;
			case "Mensalmente":
				// Simplified monthly calculation
				return daysDiff % (daily.repeat.frequency * 30) === 0;
			default:
				return false;
		}
	}
}
