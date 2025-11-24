import type { DailyRepository, DailyPeriodRepository } from "@/domain/repositories/all-repository";
import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";

export interface ReactivateDailyPeriodsInput {
  userId: string;
}

export interface ReactivateDailyPeriodsOutput {
  reactivatedCount: number;
}

export class ReactivateDailyPeriodsUseCase {
  constructor(
    private dailyRepository: DailyRepository,
    private dailyPeriodRepository: DailyPeriodRepository
  ) {}

  async execute(input: ReactivateDailyPeriodsInput): Promise<ReactivateDailyPeriodsOutput> {
    const { userId } = input;
    const now = new Date();
    let reactivatedCount = 0;

    const dailies = await this.dailyRepository.findByUserId(userId);

    for (const daily of dailies) {
      if (new Date(daily.startDate) > now) continue;

      const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(daily.id);

      if (!activePeriod && this.shouldCreateNewPeriod(daily, now)) {
        const startDate = daily.lastCompletedDate
          ? DailyPeriodCalculator.calculateNextStartDate(
              daily.repeat.type,
              new Date(daily.lastCompletedDate),
              daily.repeat.frequency
            )
          : new Date(daily.startDate);

        const endDate = DailyPeriodCalculator.calculatePeriodEnd(
          daily.repeat.type,
          startDate,
          daily.repeat.frequency
        );

        await this.dailyPeriodRepository.create({
          dailyId: daily.id,
          periodType: daily.repeat.type,
          startDate,
          endDate,
          isCompleted: false,
          isActive: true,
        });

        reactivatedCount++;
      }
    }

    return { reactivatedCount };
  }

  private shouldCreateNewPeriod(daily: any, now: Date): boolean {
    if (!daily.lastCompletedDate) return true;

    const lastCompleted = new Date(daily.lastCompletedDate);
    return DailyPeriodCalculator.shouldBeAvailable(
      daily.repeat.type,
      lastCompleted,
      now,
      daily.repeat.frequency
    );
  }
}
