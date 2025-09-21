import { DailyApplicationService } from "@/application/services/daily-application-service";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { FetchHttpClient } from "@/infra/services/http-client";
import { FetchTodoHttpAdapter } from "@/infra/adapters/http/todo-http-adapter";
import { TodoRepositoryImpl } from "@/infra/repositories/todo-repository-impl";

class DIContainer {
  private instances = new Map<string, any>();

  // HTTP Client
  getHttpClient() {
    if (!this.instances.has('httpClient')) {
      this.instances.set('httpClient', new FetchHttpClient());
    }
    return this.instances.get('httpClient');
  }

  // HTTP Adapters
  getTodoHttpAdapter() {
    if (!this.instances.has('todoHttpAdapter')) {
      this.instances.set('todoHttpAdapter', new FetchTodoHttpAdapter(this.getHttpClient()));
    }
    return this.instances.get('todoHttpAdapter');
  }

  // Repositories
  getTodoRepository() {
    if (!this.instances.has('todoRepository')) {
      this.instances.set('todoRepository', new TodoRepositoryImpl(this.getTodoHttpAdapter()));
    }
    return this.instances.get('todoRepository');
  }

  getDailyRepository() {
    if (!this.instances.has('dailyRepository')) {
      this.instances.set('dailyRepository', new PrismaDailyRepository());
    }
    return this.instances.get('dailyRepository');
  }

  getDailyLogRepository() {
    if (!this.instances.has('dailyLogRepository')) {
      this.instances.set('dailyLogRepository', new PrismaDailyLogRepository());
    }
    return this.instances.get('dailyLogRepository');
  }

  getDailyPeriodRepository() {
    if (!this.instances.has('dailyPeriodRepository')) {
      this.instances.set('dailyPeriodRepository', new PrismaDailyPeriodRepository());
    }
    return this.instances.get('dailyPeriodRepository');
  }

  getHabitRepository() {
    if (!this.instances.has('habitRepository')) {
      this.instances.set('habitRepository', new PrismaHabitRepository());
    }
    return this.instances.get('habitRepository');
  }

  // Application Services
  getDailyApplicationService() {
    if (!this.instances.has('dailyApplicationService')) {
      this.instances.set('dailyApplicationService', new DailyApplicationService(
        this.getDailyRepository(),
        this.getDailyLogRepository(),
        this.getDailyPeriodRepository()
      ));
    }
    return this.instances.get('dailyApplicationService');
  }

  // Clear instances (useful for testing)
  clear() {
    this.instances.clear();
  }
}

export const container = new DIContainer();