import type { Daily } from "@/domain/entities/daily";
import type { DailyLogRepository, DailyPeriodRepository, DailyRepository } from "@/domain/repositories/all-repository";

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
    const daily = await this.dailyRepository.markComplete(dailyId);
    const nextPeriod = await this.dailyPeriodRepository.findActiveByDailyId(dailyId);
    const nextAvailableAt = nextPeriod 
      ? nextPeriod.startDate 
      : this.calculateNextPeriodStart(daily.repeat.type, new Date(), daily.repeat.frequency);

    return { daily, nextAvailableAt };
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