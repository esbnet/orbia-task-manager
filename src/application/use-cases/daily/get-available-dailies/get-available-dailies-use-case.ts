import type { DailyRepository, DailyLogRepository, DailyPeriodRepository } from "@/domain/repositories/all-repository";
import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";

export interface GetAvailableDailiesInput {
  userId: string;
}

export interface GetAvailableDailiesOutput {
  availableDailies: any[];
  completedToday: any[];
  totalDailies: number;
}

export class GetAvailableDailiesUseCase {
  constructor(
    private dailyRepository: DailyRepository,
    private dailyLogRepository: DailyLogRepository,
    private dailyPeriodRepository: DailyPeriodRepository
  ) {}

  async execute(input: GetAvailableDailiesInput): Promise<GetAvailableDailiesOutput> {
    const { userId } = input;

    const allDailies = await this.dailyRepository.findByUserId(userId);
    const dailies = allDailies.filter(d => d.status !== "archived");
    
    if (dailies.length === 0) {
      return {
        availableDailies: [],
        completedToday: [],
        totalDailies: 0,
      };
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const availableDailies = [];
    const completedToday = [];

    for (const daily of dailies) {
      if (new Date(daily.startDate) > now) continue;

      const lastLogDate = daily.lastCompletedDate
        ? new Date(daily.lastCompletedDate)
        : await this.dailyLogRepository.getLastLogDate(daily.id);

      const lastCompletedDate = lastLogDate ?? null;
      const hasCompletion = !!lastCompletedDate;
      const periodStart = lastCompletedDate ?? new Date(daily.startDate);

      // Sem conclusão prévia: sempre disponível
      if (!hasCompletion) {
        availableDailies.push({
          ...daily,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          isAvailable: true,
          isOverdue: false,
        });
        continue;
      }

      const nextAvailableAt = DailyPeriodCalculator.calculateNextStartDate(
        daily.repeat.type,
        periodStart,
        daily.repeat.frequency
      );

      const isCompletedToday = lastCompletedDate
        ? lastCompletedDate.toISOString().split('T')[0] === today
        : false;

      if (isCompletedToday) {
        completedToday.push({
          ...daily,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          isAvailable: false,
          nextAvailableAt,
        });
        continue;
      }

      const isOverdue = now > nextAvailableAt;
      const canReopen = now >= nextAvailableAt;

      if (canReopen) {
        availableDailies.push({
          ...daily,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          isAvailable: true,
          isOverdue,
        });
      } else {
        completedToday.push({
          ...daily,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          isAvailable: false,
          nextAvailableAt,
        });
      }
    }

    return {
      availableDailies,
      completedToday,
      totalDailies: dailies.length,
    };
  }
}
