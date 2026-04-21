import { PrismaHabitLogRepository } from "@/infra/database/prisma/prisma-habit-log-repository";
import { HttpGoalRepository } from "@/infra/repositories/http/http-goal-repository";
import { GoalService } from "./goal-service";
import { HabitService } from "./habit-service";
// Dependency Injection Container
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaTodoLogRepository } from "@/infra/database/prisma/prisma-todo-log-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import { TodoService } from "./todo-service";

// Service registry type
type ServiceRegistry = {
	goalService: GoalService;
	habitService: HabitService;
	todoService: TodoService;
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

	private getHabitLogRepository() {
		if (!this.repositories.has("habitLog")) {
			this.repositories.set("habitLog", new PrismaHabitLogRepository());
		}
		return this.repositories.get("habitLog");
	}

	private getTodoLogRepository() {
		if (!this.repositories.has("todoLog")) {
			this.repositories.set("todoLog", new PrismaTodoLogRepository());
		}
		return this.repositories.get("todoLog");
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
			this.services.habitService = new HabitService(
				this.getHabitRepository(),
				this.getHabitLogRepository()
			);
		}
		return this.services.habitService;
	}

	getTodoService(): TodoService {
		if (!this.services.todoService) {
			this.services.todoService = new TodoService(
				this.getTodoRepository(),
				this.getTodoLogRepository()
			);
		}
		return this.services.todoService;
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

