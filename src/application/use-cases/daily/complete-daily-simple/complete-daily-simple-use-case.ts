import type { DailyLogRepository, DailyRepository } from "@/domain/repositories/all-repository";

export interface CompleteDailyInput {
  dailyId: string;
  userId: string;
}

export interface CompleteDailyOutput {
  success: boolean;
  logId: string;
}

export class CompleteDailyUseCase {
  constructor(
    private dailyRepository: DailyRepository,
    private dailyLogRepository: DailyLogRepository
  ) {}

  async execute(input: CompleteDailyInput): Promise<CompleteDailyOutput> {
    const daily = await this.dailyRepository.findById(input.dailyId);
    
    if (!daily || daily.userId !== input.userId) {
      throw new Error("Daily não encontrada");
    }

    const log = await this.dailyLogRepository.create({
      dailyId: daily.id,
      dailyTitle: daily.title,
      difficulty: daily.difficulty,
      tags: daily.tags,
      completedAt: new Date(),
    });

    return {
      success: true,
      logId: log.id,
    };
  }
}
