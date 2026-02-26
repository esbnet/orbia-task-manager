import { DailyApplicationService } from "@/application/services/daily-application-service";
import { FetchTodoHttpAdapter } from "@/infra/adapters/http/todo-http-adapter";
import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaTagRepository } from "@/infra/database/prisma/prisma-tag-repository";
import { TodoRepositoryImpl } from "@/infra/repositories/todo-repository-impl";
import { FetchHttpClient } from "@/infra/services/http-client";
import { PrismaTodoLogRepository } from "../database/prisma/prisma-todo-log-repository";

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

  getTagRepository() {
    if (!this.instances.has('tagRepository')) {
      this.instances.set('tagRepository', new PrismaTagRepository());
    }
    return this.instances.get('tagRepository');
  }

  getTodoLogRepository() {
    if (!this.instances.has('todoLogRepository')) {
      this.instances.set('todoLogRepository', new PrismaTodoLogRepository());
    }
    return this.instances.get('todoLogRepository');
  }

  getPrismaTodoRepository() {
    if (!this.instances.has('prismaTodoRepository')) {
      this.instances.set('prismaTodoRepository', new PrismaTodoLogRepository());
    }
    return this.instances.get('prismaTodoRepository');
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