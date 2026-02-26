export type RepeatType = "Diariamente" | "Semanalmente" | "Mensalmente" | "Anualmente";

export interface RepeatConfig {
	type: RepeatType;
	frequency: number;
}

export class DailyPeriodCalculator {
	/**
	 * Calcula a próxima data de início baseada no tipo de repetição e data de conclusão
	 */
	static calculateNextStartDate(repeatType: RepeatType, completedAt: Date, frequency: number): Date {
		const nextStart = new Date(completedAt);

		switch (repeatType) {
			case "Diariamente":
				nextStart.setDate(completedAt.getDate() + frequency);
				nextStart.setHours(0, 0, 0, 0);
				break;
			case "Semanalmente":
				// Para tarefas semanais, reaparecer no início da próxima semana (segunda-feira)
				const daysUntilNextWeek = (7 - completedAt.getDay() + 1) % 7; // 1 = segunda-feira
				const daysToAdd = daysUntilNextWeek === 0 ? 7 : daysUntilNextWeek;
				nextStart.setDate(completedAt.getDate() + daysToAdd + (7 * (frequency - 1)));
				nextStart.setHours(0, 0, 0, 0);
				break;
			case "Mensalmente":
				nextStart.setMonth(completedAt.getMonth() + frequency);
				nextStart.setDate(1); // Primeiro dia do mês
				nextStart.setHours(0, 0, 0, 0);
				break;
			case "Anualmente":
				nextStart.setFullYear(completedAt.getFullYear() + frequency);
				nextStart.setMonth(0, 1); // 1 de janeiro
				nextStart.setHours(0, 0, 0, 0);
				break;
			default:
				nextStart.setHours(0, 0, 0, 0);
		}

		return nextStart;
	}

	/**
	 * Calcula a data de fim do período baseado no tipo de repetição
	 */
	static calculatePeriodEnd(repeatType: RepeatType, startDate: Date, frequency: number): Date {
		const endDate = new Date(startDate);

		switch (repeatType) {
			case "Diariamente":
				endDate.setHours(23, 59, 59, 999);
				break;
			case "Semanalmente":
				endDate.setDate(endDate.getDate() + (7 * frequency - 1));
				endDate.setHours(23, 59, 59, 999);
				break;
			case "Mensalmente":
				endDate.setMonth(endDate.getMonth() + frequency);
				endDate.setDate(0); // Último dia do mês
				endDate.setHours(23, 59, 59, 999);
				break;
			case "Anualmente":
				endDate.setFullYear(endDate.getFullYear() + frequency);
				endDate.setMonth(11, 31); // 31 de dezembro
				endDate.setHours(23, 59, 59, 999);
				break;
			default:
				endDate.setHours(23, 59, 59, 999);
		}

		return endDate;
	}

	/**
	 * Verifica se uma daily deveria estar disponível baseado na última conclusão
	 */
	static shouldBeAvailable(repeatType: RepeatType, lastCompleted: Date | null, currentDate: Date, frequency: number): boolean {
		if (!lastCompleted) {
			return true;
		}

		const nextAvailable = this.calculateNextStartDate(repeatType, lastCompleted, frequency);
		return currentDate >= nextAvailable;
	}
}
