import type { DailyRepository } from "@/domain/repositories/all-repository";
import type { DailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
import type { Daily } from "@/types";

export interface GetAvailableDailiesInput {
	userId?: string;
}

export interface DailyWithStatus {
	id: string;
	title: string;
	observations: string;
	difficulty: string;
	repeatType: string;
	repeatFrequency: number;
	tags: string[];
	isAvailable: boolean;
	currentPeriod?: {
		id: string;
		startDate: Date;
		endDate: Date | null;
		isCompleted: boolean;
	};
	nextAvailableAt?: Date;
}

export interface GetAvailableDailiesOutput {
	availableDailies: DailyWithStatus[];
	completedToday: DailyWithStatus[];
	totalDailies: number;
}

export class GetAvailableDailiesUseCase {
	constructor(
		private dailyRepository: DailyRepository,
		private dailyPeriodRepository: DailyPeriodRepository,
	) {}

	async execute(input: GetAvailableDailiesInput): Promise<GetAvailableDailiesOutput> {
		// 1. Buscar todas as dailies do usuário
		const allDailies = await this.dailyRepository.findByUserId(input.userId!);

		// 2. Para cada daily, verificar status do período atual
		const dailiesWithStatus: DailyWithStatus[] = [];
		const availableDailies: DailyWithStatus[] = [];
		const completedToday: DailyWithStatus[] = [];

		for (const daily of allDailies) {
			const dailyWithStatus = await this.getDailyStatus(daily);
			dailiesWithStatus.push(dailyWithStatus);

			if (dailyWithStatus.isAvailable) {
				availableDailies.push(dailyWithStatus);
			} else if (dailyWithStatus.currentPeriod?.isCompleted) {
				completedToday.push(dailyWithStatus);
			}
		}

		return {
			availableDailies,
			completedToday,
			totalDailies: allDailies.length,
		};
	}

	private async getDailyStatus(daily: Daily): Promise<DailyWithStatus> {
		// Buscar período ativo
		const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(daily.id);
		
		let isAvailable = true;
		let currentPeriod = undefined;
		let nextAvailableAt = undefined;

		if (activePeriod) {
			currentPeriod = {
				id: activePeriod.id,
				startDate: activePeriod.startDate,
				endDate: activePeriod.endDate,
				isCompleted: activePeriod.isCompleted,
			};

			// Se já foi completada, não está disponível
			if (activePeriod.isCompleted) {
				isAvailable = false;
				nextAvailableAt = this.calculateNextPeriodStart(daily.repeat.type , activePeriod.endDate!);
			}
		} else {
			// Se não há período ativo, verificar se deveria ter um
			// (baseado na data de início e tipo de repetição)
			const shouldHavePeriod = this.shouldHaveActivePeriod(daily);
			if (shouldHavePeriod) {
				// Criar período automaticamente será feito no momento da conclusão
				isAvailable = true;
			}
		}

		return {
			id: daily.id,
			title: daily.title,
			observations: daily.observations,
			difficulty: daily.difficulty,
			repeatType: daily.repeat.type,
			repeatFrequency: daily.repeat.frequency,
			tags: daily.tags,
			isAvailable,
			currentPeriod,
			nextAvailableAt,
		};
	}

	private shouldHaveActivePeriod(daily: Daily): boolean {
		const now = new Date();
		const startDate = new Date(daily.startDate);
		
		// Se a data de início já passou, deveria ter um período ativo
		return now >= startDate;
	}

	private calculateNextPeriodStart(repeatType: string, completedAt: Date): Date {
		const nextStart = new Date(completedAt);
		
		switch (repeatType) {
			case "Diariamente":
				nextStart.setDate(nextStart.getDate() + 1);
				nextStart.setHours(0, 0, 0, 0);
				break;
			case "Semanalmente":
				nextStart.setDate(nextStart.getDate() + 7);
				break;
			case "Mensalmente":
				nextStart.setMonth(nextStart.getMonth() + 1);
				break;
			default:
				nextStart.setDate(nextStart.getDate() + 1);
		}
		
		return nextStart;
	}
}
