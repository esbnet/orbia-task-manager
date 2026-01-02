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

      const hasLogToday = await this.dailyLogRepository.hasLogForDate(daily.id, today);
      const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(daily.id);

      if (hasLogToday) {
        const nextAvailableAt = DailyPeriodCalculator.calculateNextStartDate(
          daily.repeat.type,
          new Date(),
          daily.repeat.frequency
        );
        completedToday.push({
          ...daily,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          isAvailable: false,
          nextAvailableAt,
        });
      } else if (activePeriod && !activePeriod.isCompleted) {
        availableDailies.push({
          ...daily,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          isAvailable: true,
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