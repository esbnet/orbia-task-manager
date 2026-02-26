import type { DailyRepository, DailyPeriodRepository } from "@/domain/repositories/all-repository";
import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";
import type { DailyLogRepository } from "@/domain/repositories/daily-log-repository";

export interface ReactivateDailyPeriodsInput {
  userId: string;
}

export interface ReactivateDailyPeriodsOutput {
  reactivatedCount: number;
  failedPeriods: number;
}

export class ReactivateDailyPeriodsUseCase {
  constructor(
    private dailyRepository: DailyRepository,
    private dailyPeriodRepository: DailyPeriodRepository,
    private dailyLogRepository: DailyLogRepository
  ) {}

  async execute(input: ReactivateDailyPeriodsInput): Promise<ReactivateDailyPeriodsOutput> {
    const { userId } = input;
    const now = new Date();
    let reactivatedCount = 0;
    let failedPeriods = 0;

    const dailies = await this.dailyRepository.findByUserId(userId);

    for (const daily of dailies) {
      if (new Date(daily.startDate) > now) continue;

      const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(daily.id);

      if (activePeriod) {
        const endDate = activePeriod.endDate ? new Date(activePeriod.endDate) : null;
        const isExpired = endDate ? now > endDate : false;

        // Se período expirou sem concluir, registra fail e cria próximo
        if (isExpired && !activePeriod.isCompleted) {
          await this.dailyPeriodRepository.update(activePeriod.id, { isCompleted: true, isActive: false });
          await this.dailyLogRepository.create({
            dailyId: daily.id,
            periodId: activePeriod.id,
            dailyTitle: daily.title,
            difficulty: daily.difficulty,
            tags: daily.tags,
            status: "fail",
            completedAt: endDate || now,
          });
          failedPeriods++;

          const nextStart = DailyPeriodCalculator.calculateNextStartDate(
            daily.repeat.type,
            endDate || now,
            daily.repeat.frequency
          );
          const nextEnd = DailyPeriodCalculator.calculatePeriodEnd(
            daily.repeat.type,
            nextStart,
            daily.repeat.frequency
          );

          await this.dailyPeriodRepository.create({
            dailyId: daily.id,
            periodType: daily.repeat.type,
            startDate: nextStart,
            endDate: nextEnd,
            isCompleted: false,
            isActive: true,
          });

          reactivatedCount++;
          continue;
        } else {
          // Já tem período ativo e não expirou: nada a fazer
          continue;
        }
      }

      if (this.shouldCreateNewPeriod(daily, now)) {
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

    return { reactivatedCount, failedPeriods };
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
