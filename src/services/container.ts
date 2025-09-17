import { PrismaDailyLogRepository } from "@/infra/database/prisma/prisma-daily-log-repository";
import { PrismaDailyPeriodRepository } from "@/infra/database/prisma/prisma-daily-period-repository";
import { HttpGoalRepository } from "@/infra/repositories/http/http-goal-repository";
import { DailyService } from "./daily-service";
import { GoalService } from "./goal-service";
import { HabitService } from "./habit-service";
// Dependency Injection Container
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import { TodoService } from "./todo-service";

// Service registry type
type ServiceRegistry = {
	goalService: GoalService;
	habitService: HabitService;
	todoService: TodoService;
	dailyService: DailyService;
};

// Container class
class ServiceContainer {
	private services: Partial<ServiceRegistry> = {};
	private repositories: Map<string, any> = new Map(); 

	// Repository getters with lazy initialization
	private getGoalRepository() {
		if (!this.repositories.has("goal")) {
			this.repositories.set("goal", new HttpGoalRepository());
		}
		return this.repositories.get("goal");
	}

	private getHabitRepository() {
		if (!this.repositories.has("habit")) {
			this.repositories.set("habit", new PrismaHabitRepository());
		}
		return this.repositories.get("habit");
	}

	private getTodoRepository() {
		if (!this.repositories.has("todo")) {
			this.repositories.set("todo", new PrismaTodoRepository());
		}
		return this.repositories.get("todo");
	}

	private getDailyRepository() {
		if (!this.repositories.has("daily")) {
			this.repositories.set("daily", new PrismaDailyRepository());
		}
		return this.repositories.get("daily");
	}

	private getDailyLogRepository() {
		if (!this.repositories.has("dailyLog")) {
			this.repositories.set("dailyLog", new PrismaDailyLogRepository());
		}
		return this.repositories.get("dailyLog");
	}

	private getDailyPeriodRepository() {
		if (!this.repositories.has("dailyPeriod")) {
			this.repositories.set("dailyPeriod", new PrismaDailyPeriodRepository());
		}
		return this.repositories.get("dailyPeriod");
	}

	// Service getters with lazy initialization
	getGoalService(): GoalService {
		if (!this.services.goalService) {
			this.services.goalService = new GoalService(this.getGoalRepository());
		}
		return this.services.goalService;
	}

	getHabitService(): HabitService {
		if (!this.services.habitService) {
			this.services.habitService = new HabitService(this.getHabitRepository());
		}
		return this.services.habitService;
	}

	getTodoService(): TodoService {
		if (!this.services.todoService) {
			this.services.todoService = new TodoService(this.getTodoRepository());
		}
		return this.services.todoService;
	}

	getDailyService(): DailyService {
		if (!this.services.dailyService) {
			this.services.dailyService = new DailyService(this.getDailyRepository(), this.getDailyLogRepository(), this.getDailyPeriodRepository());
		}
		return this.services.dailyService;
	}

	// Method to register custom services (for testing or different environments)
	registerService<K extends keyof ServiceRegistry>(
		key: K,
		service: ServiceRegistry[K]
	): void {
		this.services[key] = service;
	}

	// Method to register custom repositories
	registerRepository(key: string, repository: unknown): void {
		this.repositories.set(key, repository);
	}

	// Clear all services and repositories (useful for testing)
	clear(): void {
		this.services = {};
		this.repositories.clear();
	}
}

// Singleton instance
const container = new ServiceContainer();

// Export singleton instance
export { container };

// Export types for type safety
    export type { ServiceRegistry };

