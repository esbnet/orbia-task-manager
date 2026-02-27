import type { Daily } from "@/domain/entities/daily";
import type { DailyLogRepository, DailyPeriodRepository, DailyRepository } from "@/domain/repositories/all-repository";
import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";

export interface CreateDailyInput {
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

export interface CompleteDailyOutput {
  daily: Daily;
  nextAvailableAt: Date;
}

export class DailyApplicationService {
  constructor(
    private dailyRepository: DailyRepository,
    private dailyLogRepository: DailyLogRepository,
    private dailyPeriodRepository: DailyPeriodRepository
  ) {}

  async createDaily(input: CreateDailyInput, userId: string): Promise<Daily> {
    const dailyData: Omit<Daily, "id" | "createdAt" | "updatedAt"> = {
      title: input.title,
      observations: input.observations,
      tasks: input.tasks,
      difficulty: input.difficulty,
      startDate: input.startDate,
      repeat: input.repeat,
      tags: input.tags,
      userId,
      order: 0,
      lastCompletedDate: undefined,
    };

    return await this.dailyRepository.create(dailyData);
  }

  async completeDaily(dailyId: string): Promise<CompleteDailyOutput> {
    const daily = await this.dailyRepository.findById(dailyId);
    if (!daily) {
      throw new Error("Daily not found");
    }

    let activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(dailyId);
    const now = new Date();

    if (!activePeriod) {
      activePeriod = await this.dailyPeriodRepository.create({
        dailyId: daily.id,
        periodType: daily.repeat.type,
        startDate: now,
        endDate: DailyPeriodCalculator.calculatePeriodEnd(
          daily.repeat.type,
          now,
          daily.repeat.frequency
        ),
        isCompleted: false,
        isActive: true,
      });
    }

    if (activePeriod.isCompleted) {
      throw new Error("Daily already completed in this period");
    }

    const completedPeriod = await this.dailyPeriodRepository.completeAndFinalize(activePeriod.id);
    const completedAt = completedPeriod.endDate || now;

    await this.dailyLogRepository.create({
      dailyId: daily.id,
      periodId: completedPeriod.id,
      dailyTitle: daily.title,
      difficulty: daily.difficulty,
      tags: daily.tags,
      status: "success",
      completedAt,
    });

    const nextAvailableAt = DailyPeriodCalculator.calculateNextStartDate(
      daily.repeat.type,
      completedAt,
      daily.repeat.frequency
    );

    await this.dailyPeriodRepository.create({
      dailyId: daily.id,
      periodType: daily.repeat.type,
      startDate: nextAvailableAt,
      endDate: DailyPeriodCalculator.calculatePeriodEnd(
        daily.repeat.type,
        nextAvailableAt,
        daily.repeat.frequency
      ),
      isCompleted: false,
      isActive: true,
    });

    const updatedDaily = await this.dailyRepository.update({
      ...daily,
      lastCompletedDate: completedAt.toISOString().split("T")[0],
    });

    return { daily: updatedDaily, nextAvailableAt };
  }

  async getAvailableDailies(userId: string) {
    const dailies = await this.dailyRepository.findByUserId(userId);
    const today = new Date();
    const available: Daily[] = [];
    const completed: (Daily & { nextAvailableAt: Date })[] = [];

    for (const daily of dailies) {
      const activePeriod = await this.dailyPeriodRepository.findActiveByDailyId(daily.id);
      if (activePeriod?.isCompleted) {
        const nextAvailableAt = this.calculateNextPeriodStart(
          daily.repeat.type, 
          activePeriod.endDate || today, 
          daily.repeat.frequency
        );
        completed.push({ ...daily, nextAvailableAt });
      } else {
        available.push(daily);
      }
    }

    return { availableDailies: available, completedToday: completed, totalDailies: dailies.length };
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
        break;
      case "Mensalmente":
        nextStart.setMonth(nextStart.getMonth() + frequency);
        break;
      case "Anualmente":
        nextStart.setFullYear(nextStart.getFullYear() + frequency);
        break;
      default:
        nextStart.setDate(nextStart.getDate() + frequency);
    }
    return nextStart;
  }
}
