import type { DailyLog } from "@/domain/entities/daily-log";
import type { DailyLogRepository } from "@/domain/repositories/daily-log-repository";
import type { CreateEntityData } from "@/domain/repositories/base-repository";
import { prisma } from "./prisma-client";

export class PrismaDailyLogRepository implements DailyLogRepository {
  async list(): Promise<DailyLog[]> {
    const logs = await prisma.dailyLog.findMany();
    return logs.map(this.toDomain);
  }

  async findById(id: string): Promise<DailyLog | null> {
    const log = await prisma.dailyLog.findUnique({ where: { id } });
    return log ? this.toDomain(log) : null;
  }

  async create(data: CreateEntityData<DailyLog>): Promise<DailyLog> {
    const log = await prisma.dailyLog.create({ data });
    return this.toDomain(log);
  }

  async update(entity: DailyLog): Promise<DailyLog> {
    const log = await prisma.dailyLog.update({
      where: { id: entity.id },
      data: entity,
    });
    return this.toDomain(log);
  }

  async delete(id: string): Promise<void> {
    await prisma.dailyLog.delete({ where: { id } });
  }

  async findByEntityId(entityId: string): Promise<DailyLog[]> {
    const logs = await prisma.dailyLog.findMany({
      where: { dailyId: entityId },
      orderBy: { completedAt: 'desc' },
    });
    return logs.map(this.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<DailyLog[]> {
    const logs = await prisma.dailyLog.findMany({
      where: {
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return logs.map(this.toDomain);
  }

  async deleteOlderThan(date: Date): Promise<void> {
    await prisma.dailyLog.deleteMany({
      where: {
        completedAt: {
          lt: date,
        },
      },
    });
  }

  async hasLogForDate(dailyId: string, date: string): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const log = await prisma.dailyLog.findFirst({
      where: {
        dailyId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return !!log;
  }

  async getLastLogDate(dailyId: string): Promise<Date | null> {
    const log = await prisma.dailyLog.findFirst({
      where: {
        dailyId,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return log ? log.completedAt : null;
  }

  private toDomain(prismaLog: any): DailyLog {
    return {
      id: prismaLog.id,
      dailyId: prismaLog.dailyId,
      periodId: prismaLog.periodId,
      dailyTitle: prismaLog.dailyTitle,
      difficulty: prismaLog.difficulty,
      tags: prismaLog.tags || [],
      completedAt: prismaLog.completedAt,
      createdAt: prismaLog.createdAt,
    };
  }
}