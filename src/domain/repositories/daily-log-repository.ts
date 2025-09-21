import type { LogRepository } from "./base-repository";
import type { DailyLog } from "../entities/daily-log";

export interface DailyLogRepository extends LogRepository<DailyLog> {
  hasLogForDate(dailyId: string, date: string): Promise<boolean>;
  getLastLogDate(dailyId: string): Promise<Date | null>;
}