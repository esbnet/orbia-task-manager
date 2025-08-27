import type { DailyRepository } from "@/domain/repositories/all-repository";
import type { DailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
import type { Daily } from "@/types";

export interface CompleteDailyInput {
	dailyId: string;
}

export interface CompleteDailyOutput {
	success: boolean;
	message: string;
	periodId: string;
	nextPeriodStart?: Date;
}

export class CompleteDailyUseCase {
	constructor(
		private dailyRepository: DailyRepository,
		private dailyPeriodRepository: DailyPeriodRepository,
	) {}

	async execute(input: CompleteDailyInput): Promise<CompleteDailyOutput> {
		// 1. Verificar se a daily existe
		const daily = await this.dailyRepository.findById(input.dailyId);
		if (!daily) {
			throw new Error("Daily não encontrada");
		}

		// 2. Buscar período ativo
		let activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(input.dailyId);
		
		// 3. Se não há período ativo, criar um novo
		if (!activePeriod) {
			activePeriod = await this.createNewPeriod(input.dailyId, daily.repeat.type);
		}

		// 4. Verificar se já foi completada neste período
		if (activePeriod.isCompleted) {
			throw new Error("Daily já foi completada neste período");
		}

		// 5. Marcar como completada e finalizar período
		const completedPeriod = await this.dailyPeriodRepository.completeAndFinalize(activePeriod.id);

		// 6. Criar log da conclusão
		await this.createCompletionLog(input.dailyId, completedPeriod.id, daily);

		// 7. Calcular próximo período
		const nextPeriodStart = this.calculateNextPeriodStart(daily.repeat.type, completedPeriod.endDate!);

		return {
			success: true,
			message: `Daily "${daily.title}" completada com sucesso!`,
			periodId: completedPeriod.id,
			nextPeriodStart,
		};
	}

	private async createNewPeriod(dailyId: string, repeatType: string) {
		const now = new Date();
		const endDate = this.calculatePeriodEnd(repeatType, now);

		return await this.dailyPeriodRepository.create({
			dailyId,
			periodType: repeatType,
			startDate: now,
			endDate,
			isCompleted: false,
			isActive: true,
		});
	}

	private calculatePeriodEnd(repeatType: string, startDate: Date): Date {
		const endDate = new Date(startDate);
		
		switch (repeatType) {
			case "Diariamente":
				endDate.setDate(endDate.getDate() + 1);
				endDate.setHours(0, 0, 0, 0); // Início do próximo dia
				break;
			case "Semanalmente":
				endDate.setDate(endDate.getDate() + 7);
				break;
			case "Mensalmente":
				endDate.setMonth(endDate.getMonth() + 1);
				break;
			default:
				endDate.setDate(endDate.getDate() + 1);
		}
		
		return endDate;
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

	private async createCompletionLog(dailyId: string, periodId: string, daily: Daily) {
		// Aqui você pode implementar a criação do log usando o repositório de DailyLog
		// Por enquanto, vamos deixar como placeholder
		console.log(`Daily ${dailyId} completed in period ${periodId} - ${daily.title}`);
	}
}
