import type { DailyLogRepository, DailyPeriodRepository, DailyRepository } from "@/domain/repositories/all-repository";
import { BaseEntityService, handleServiceError } from "./base/entity-service";

import type { Daily } from "@/domain/entities/daily";
import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";

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
			const todayStr = today.toISOString().split('T')[0];
			const available: Daily[] = [];
			const completed: (Daily & { nextAvailableAt: Date })[] = [];

			for (const daily of dailies) {
				if (new Date(daily.startDate) > today) continue;

				const hasLogToday = await this.dailyLogRepository.hasLogForDate(daily.id, todayStr);
				const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(daily.id);

				if (hasLogToday) {
					const nextAvailableAt = DailyPeriodCalculator.calculateNextStartDate(
						daily.repeat.type,
						today,
						daily.repeat.frequency
					);
					completed.push({ ...daily, nextAvailableAt });
					continue;
				}

				if (activePeriod) {
					if (!activePeriod.isCompleted) {
						available.push(daily);
					} else if (activePeriod.endDate && today > new Date(activePeriod.endDate)) {
						available.push(daily);
					}
				} else {
					available.push(daily);
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

	private shouldCreatePeriod(daily: Daily, now: Date): boolean {
		if (!daily.lastCompletedDate) return true;

		const lastCompleted = new Date(daily.lastCompletedDate);
		return DailyPeriodCalculator.shouldBeAvailable(
			daily.repeat.type,
			lastCompleted,
			now,
			daily.repeat.frequency
		);
	}

	private calculateNextPeriodStart(type: string, fromDate: Date, frequency: number): Date {
		return DailyPeriodCalculator.calculateNextStartDate(
			type as "Diariamente" | "Semanalmente" | "Mensalmente" | "Anualmente",
			fromDate,
			frequency
		);
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

	private shouldShowToday(daily: Daily): boolean {
		const today = new Date();
		const startDate = new Date(daily.startDate);
		
		if (startDate > today) return false;

		if (!daily.lastCompletedDate) return true;

		const lastCompleted = new Date(daily.lastCompletedDate);
		return DailyPeriodCalculator.shouldBeAvailable(
			daily.repeat.type,
			lastCompleted,
			today,
			daily.repeat.frequency
		);
	}
}
