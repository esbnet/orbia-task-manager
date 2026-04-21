import { FetchTodoHttpAdapter } from "@/infra/adapters/http/todo-http-adapter";
import { PrismaHabitEntryRepository } from "@/infra/database/prisma/prisma-habit-entry-repository";
import { PrismaHabitPeriodRepository } from "@/infra/database/prisma/prisma-habit-period-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaTagRepository } from "@/infra/database/prisma/prisma-tag-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
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

  getHabitRepository() {
    if (!this.instances.has('habitRepository')) {
      this.instances.set('habitRepository', new PrismaHabitRepository());
    }
    return this.instances.get('habitRepository');
  }

  getHabitPeriodRepository() {
    if (!this.instances.has('habitPeriodRepository')) {
      this.instances.set('habitPeriodRepository', new PrismaHabitPeriodRepository());
    }
    return this.instances.get('habitPeriodRepository');
  }

  getHabitEntryRepository() {
    if (!this.instances.has('habitEntryRepository')) {
      this.instances.set('habitEntryRepository', new PrismaHabitEntryRepository());
    }
    return this.instances.get('habitEntryRepository');
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
      this.instances.set('prismaTodoRepository', new PrismaTodoRepository());
    }
    return this.instances.get('prismaTodoRepository');
  }

  // Clear instances (useful for testing)
  clear() {
    this.instances.clear();
  }
}

export const container = new DIContainer();
