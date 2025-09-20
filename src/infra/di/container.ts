// Dependency Injection Container
import type { 
  DailyRepository, 
  DailyLogRepository, 
  HabitRepository, 
  TodoRepository 
} from "@/domain/repositories/all-repository";

import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";

// Container interface
interface Container {
  getDailyRepository(): DailyRepository;
  getDailyLogRepository(): DailyLogRepository;
  getHabitRepository(): HabitRepository;
  getTodoRepository(): TodoRepository;
}

// Container implementation
class DIContainer implements Container {
  private dailyRepository?: DailyRepository;
  private dailyLogRepository?: DailyLogRepository;
  private habitRepository?: HabitRepository;
  private todoRepository?: TodoRepository;

  getDailyRepository(): DailyRepository {
    if (!this.dailyRepository) {
      this.dailyRepository = new PrismaDailyRepository();
    }
    return this.dailyRepository;
  }

  getDailyLogRepository(): DailyLogRepository {
    if (!this.dailyLogRepository) {
      this.dailyLogRepository = new PrismaDailyLogRepository();
    }
    return this.dailyLogRepository;
  }

  getHabitRepository(): HabitRepository {
    if (!this.habitRepository) {
      this.habitRepository = new PrismaHabitRepository();
    }
    return this.habitRepository;
  }

  getTodoRepository(): TodoRepository {
    if (!this.todoRepository) {
      this.todoRepository = new PrismaTodoRepository();
    }
    return this.todoRepository;
  }
}

// Singleton instance
export const container = new DIContainer();