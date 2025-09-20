import type { DailyRepository, DailyLogRepository } from "@/domain/repositories/all-repository";

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
    private dailyLogRepository: DailyLogRepository
  ) {}

  async execute(input: GetAvailableDailiesInput): Promise<GetAvailableDailiesOutput> {
    const { userId } = input;

    const dailies = await this.dailyRepository.findByUserId(userId);
    
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
      const hasLogToday = await this.dailyLogRepository.hasLogForDate(daily.id, today);
      const lastLog = await this.getLastLog(daily.id);
      
      const isAvailable = this.isDailyAvailable(daily.repeat.type, lastLog, now);

      if (hasLogToday && !isAvailable) {
        const nextAvailableAt = this.calculateNextPeriodStart(daily.repeat.type, lastLog || now);
        completedToday.push({
          id: daily.id,
          title: daily.title,
          observations: daily.observations,
          difficulty: daily.difficulty,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          tags: daily.tags,
          isAvailable: false,
          nextAvailableAt,
        });
      } else if (isAvailable) {
        availableDailies.push({
          id: daily.id,
          title: daily.title,
          observations: daily.observations,
          difficulty: daily.difficulty,
          repeatType: daily.repeat.type,
          repeatFrequency: daily.repeat.frequency,
          tags: daily.tags,
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

  private async getLastLog(dailyId: string): Promise<Date | null> {
    return await this.dailyLogRepository.getLastLogDate(dailyId);
  }

  private isDailyAvailable(repeatType: string, lastLog: Date | null, now: Date): boolean {
    if (!lastLog) {
      return true; // Se nunca foi completada, está disponível
    }

    const nextAvailable = this.calculateNextPeriodStart(repeatType, lastLog);
    return now >= nextAvailable;
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
        nextStart.setHours(0, 0, 0, 0);
        break;
      case "Mensalmente":
        nextStart.setMonth(nextStart.getMonth() + 1);
        nextStart.setHours(0, 0, 0, 0);
        break;
      default:
        nextStart.setDate(nextStart.getDate() + 1);
        nextStart.setHours(0, 0, 0, 0);
    }

    return nextStart;
  }
}