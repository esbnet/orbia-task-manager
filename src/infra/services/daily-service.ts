import { BaseEntityService, handleServiceError } from "./base/entity-service";
import type { DailyLogRepository, DailyPeriodRepository, DailyRepository } from "@/domain/repositories/all-repository";

import type { Daily } from "@/domain/entities/daily";

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
		protected repository: DailyRepository,
		private dailyLogRepository: DailyLogRepository,
		private dailyPeriodRepository: DailyPeriodRepository
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
			lastCompletedDate: undefined,
		};
	}

	// Daily-specific methods
	async completeDaily(dailyId: string): Promise<{ daily: Daily; nextAvailableAt: Date }> {
		try {
			const result = await this.repository.markComplete(dailyId);

			// Get the next active period's start as nextAvailableAt
			const nextPeriod = await this.dailyPeriodRepository.findActiveByDailyId(dailyId);
			const nextAvailableAt = nextPeriod ? nextPeriod.startDate : this.calculateNextPeriodStart(result.repeat.type, new Date(), result.repeat.frequency);

			return { daily: result, nextAvailableAt };
		} catch (error) {
			throw handleServiceError(error, "completar daily");
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
			return dailies.filter((daily) => daily.lastCompletedDate);
		} catch (error) {
			return handleServiceError(error, "buscar dailies concluídos");
		}
	}

	async findPending(): Promise<Daily[]> {
		try {
			const dailies = await this.repository.list();
			return dailies.filter((daily) => !daily.lastCompletedDate);
		} catch (error) {
			return handleServiceError(error, "buscar dailies pendentes");
		}
	}

	async findDueToday(): Promise<Daily[]> {
		try {
			const dailies = await this.repository.list();
			const today = new Date().toISOString().split("T")[0];
			
			return dailies.filter((daily) => {
				if (daily.lastCompletedDate === today) {
					return false; // Already completed today
				}

				// Check if daily should be shown today based on repeat settings
				return this.shouldShowToday(daily);
			});
		} catch (error) {
			return handleServiceError(error, "buscar dailies para hoje");
		}
	}

	async getAvailableDailies(userId: string): Promise<{ availableDailies: Daily[]; completedToday: (Daily & { nextAvailableAt: Date })[]; totalDailies: number }> {
		try {
			const dailies = await this.repository.findByUserId(userId);
			const today = new Date();
			const available: Daily[] = [];
			const completed: (Daily & { nextAvailableAt: Date })[] = [];

			for (const daily of dailies) {
				const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(daily.id);
				if (activePeriod) {
					if (activePeriod.isCompleted) {
						const periodStart = new Date(activePeriod.startDate);
						if (periodStart.toDateString() === today.toDateString()) {
							const nextAvailableAt = this.calculateNextPeriodStart(daily.repeat.type, activePeriod.endDate || today, daily.repeat.frequency);
							completed.push({ ...daily, nextAvailableAt });
						} else if (today >= activePeriod.endDate!) {
							available.push(daily);
						}
					} else {
						available.push(daily);
					}
				} else {
					const shouldShow = this.shouldShowToday(daily);
					if (shouldShow) {
						available.push(daily);
					}
				}
			}

			return {
				availableDailies: available,
				completedToday: completed,
				totalDailies: dailies.length,
			};
		} catch (error) {
			throw handleServiceError(error, "buscar dailies disponíveis");
		}
	}

	private calculateNextPeriodStart(type: string, fromDate: Date, frequency: number): Date {
		const nextStart = new Date(fromDate);
		switch (type) {
			case "Diariamente":
				nextStart.setDate(nextStart.getDate() + frequency);
				nextStart.setHours(0, 0, 0, 0);
				break;
			case "Semanalmente":
				nextStart.setDate(nextStart.getDate() + (7 * frequency));
				nextStart.setHours(0, 0, 0, 0);
				break;
			case "Mensalmente":
				nextStart.setMonth(nextStart.getMonth() + frequency);
				nextStart.setDate(1); // Primeiro dia do mês
				nextStart.setHours(0, 0, 0, 0);
				break;
			case "Anualmente":
				nextStart.setFullYear(nextStart.getFullYear() + frequency);
				nextStart.setMonth(0, 1); // 1 de janeiro
				nextStart.setHours(0, 0, 0, 0);
				break;
			default:
				nextStart.setDate(nextStart.getDate() + frequency);
				nextStart.setHours(0, 0, 0, 0);
		}
		return nextStart;
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
			return await this.update(dailyId, { tasks: updatedTasks } as Partial<Daily>);
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
			return await this.update(dailyId, { tasks: updatedTasks } as Partial<Daily>);
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
