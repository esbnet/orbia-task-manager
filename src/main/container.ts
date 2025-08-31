import type { DailyRepository, HabitRepository, TagRepository, TodoRepository } from "@/domain/repositories/all-repository";

import { CreateDailyUseCase } from "@/application/use-cases/daily/create-daily/create-daily-use-case";
import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily/delete-daily-use-case";
import { ListDailyUseCase as ListDailiesUseCase } from "@/application/use-cases/daily/list-daily/list-daily-use-case";
import { ToggleCompleteUseCase as ToggleCompleteDailyUseCase } from "@/application/use-cases/daily/toggle-complete-daily/toggle-complete-daily-use-case";
import { UpdateDailyUseCase } from "@/application/use-cases/daily/update-daily/update-daily-use-case";
import { CreateGoalUseCase } from "@/application/use-cases/goal/create-goal/create-goal-use-case";
import { ListGoalsUseCase } from "@/application/use-cases/goal/list-goals/list-goals-use-case";
import { CreateHabitUseCase } from "@/application/use-cases/habit/create-habit/create-habit-use-case";
import { DeleteHabitUseCase } from "@/application/use-cases/habit/delete-habit/delete-habit-use-case";
import { ListHabitsUseCase } from "@/application/use-cases/habit/list-habit/list-task-use-case";
import { ToggleCompleteUseCase as ToggleCompleteHabitUseCase } from "@/application/use-cases/habit/toggle-complete-habit/toggle-complete-habit-use-case";
import { UpdateHabitUseCase } from "@/application/use-cases/habit/update-habit/update-habit-use-case";
import { CreateTagUseCase } from "@/application/use-cases/tag/create-tag/create-tag-use-case";
import { DeleteTagUseCase } from "@/application/use-cases/tag/delete-tag/delete-tag-use-case";
import { ListTagUseCase as ListTagsUseCase } from "@/application/use-cases/tag/list-tag/list-tag-use-case";
import { UpdateTagUseCase } from "@/application/use-cases/tag/update-tag/update-tag-use-case";
import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/delete-todo/delete-todo-use-case";
import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { ToggleTodoUseCase } from "@/application/use-cases/todo/toggle-todo/toggle-todo-use-case";
import { UpdateTodoUseCase } from "@/application/use-cases/todo/update-todo/update-todo-use-case";
import type { GoalRepository } from "@/domain/repositories/goal-repository";
import { ApiDailyRepository } from "@/infra/repositories/http/api-daily-repository";
import { ApiHabitRepository } from "@/infra/repositories/http/api-habit-repository";
import { ApiTodoRepository } from "@/infra/repositories/http/api-todo-repository";
import { HttpGoalRepository } from "@/infra/repositories/http/http-goal-repository";

/**
 * Dependency Injection Container
 * Centraliza o gerenciamento de dependências da aplicação
 */
export class DIContainer {
	private static instance: DIContainer;
	private repositories = new Map<string, any>();
	private useCases = new Map<string, any>();

	private constructor() {
		this.initializeRepositories();
		this.initializeUseCases();
	}

	public static getInstance(): DIContainer {
		if (!DIContainer.instance) {
			DIContainer.instance = new DIContainer();
		}
		return DIContainer.instance;
	}

	private initializeRepositories(): void {
		// Repositories
		this.repositories.set("habitRepository", new ApiHabitRepository());
		this.repositories.set("todoRepository", new ApiTodoRepository());
		this.repositories.set("dailyRepository", new ApiDailyRepository());
		this.repositories.set("goalRepository", new HttpGoalRepository());
		// Tag repository can be added when implemented
	}

	private initializeUseCases(): void {
		// Habit Use Cases
		this.useCases.set("createHabitUseCase", new CreateHabitUseCase(this.getHabitRepository()));
		this.useCases.set("listHabitsUseCase", new ListHabitsUseCase(this.getHabitRepository()));
		this.useCases.set("updateHabitUseCase", new UpdateHabitUseCase(this.getHabitRepository()));
		this.useCases.set("deleteHabitUseCase", new DeleteHabitUseCase(this.getHabitRepository()));
		this.useCases.set("toggleCompleteHabitUseCase", new ToggleCompleteHabitUseCase(this.getHabitRepository()));

		// Todo Use Cases
		this.useCases.set("createTodoUseCase", new CreateTodoUseCase(this.getTodoRepository()));
		this.useCases.set("listTodosUseCase", new ListTodosUseCase(this.getTodoRepository()));
		this.useCases.set("updateTodoUseCase", new UpdateTodoUseCase(this.getTodoRepository()));
		this.useCases.set("deleteTodoUseCase", new DeleteTodoUseCase(this.getTodoRepository()));
		this.useCases.set("toggleTodoUseCase", new ToggleTodoUseCase(this.getTodoRepository()));

		// Daily Use Cases
		this.useCases.set("createDailyUseCase", new CreateDailyUseCase(this.getDailyRepository()));
		this.useCases.set("listDailiesUseCase", new ListDailiesUseCase(this.getDailyRepository()));
		this.useCases.set("updateDailyUseCase", new UpdateDailyUseCase(this.getDailyRepository()));
		this.useCases.set("deleteDailyUseCase", new DeleteDailyUseCase(this.getDailyRepository()));
		this.useCases.set("toggleCompleteDailyUseCase", new ToggleCompleteDailyUseCase(this.getDailyRepository()));

		// Tag Use Cases
		this.useCases.set("createTagUseCase", new CreateTagUseCase(this.getTagRepository()));
		this.useCases.set("listTagsUseCase", new ListTagsUseCase(this.getTagRepository()));
		this.useCases.set("updateTagUseCase", new UpdateTagUseCase(this.getTagRepository()));
		this.useCases.set("deleteTagUseCase", new DeleteTagUseCase(this.getTagRepository()));

		// Goal Use Cases
		this.useCases.set("createGoalUseCase", new CreateGoalUseCase(this.getGoalRepository()));
		this.useCases.set("listGoalsUseCase", new ListGoalsUseCase(this.getGoalRepository()));
	}

	// Repository Getters
	public getHabitRepository(): HabitRepository {
		return this.repositories.get("habitRepository");
	}

	public getTodoRepository(): TodoRepository {
		return this.repositories.get("todoRepository");
	}

	public getDailyRepository(): DailyRepository {
		return this.repositories.get("dailyRepository");
	}

	public getTagRepository(): TagRepository {
		return this.repositories.get("tagRepository");
	}

	public getGoalRepository(): GoalRepository {
		return this.repositories.get("goalRepository");
	}

	// Use Case Getters
	public getCreateHabitUseCase(): CreateHabitUseCase {
		return this.useCases.get("createHabitUseCase");
	}

	public getListHabitsUseCase(): ListHabitsUseCase {
		return this.useCases.get("listHabitsUseCase");
	}

	public getUpdateHabitUseCase(): UpdateHabitUseCase {
		return this.useCases.get("updateHabitUseCase");
	}

	public getDeleteHabitUseCase(): DeleteHabitUseCase {
		return this.useCases.get("deleteHabitUseCase");
	}

	public getToggleCompleteHabitUseCase(): ToggleCompleteHabitUseCase {
		return this.useCases.get("toggleCompleteHabitUseCase");
	}

	public getCreateTodoUseCase(): CreateTodoUseCase {
		return this.useCases.get("createTodoUseCase");
	}

	public getListTodosUseCase(): ListTodosUseCase {
		return this.useCases.get("listTodosUseCase");
	}

	public getUpdateTodoUseCase(): UpdateTodoUseCase {
		return this.useCases.get("updateTodoUseCase");
	}

	public getDeleteTodoUseCase(): DeleteTodoUseCase {
		return this.useCases.get("deleteTodoUseCase");
	}

	public getToggleTodoUseCase(): ToggleTodoUseCase {
		return this.useCases.get("toggleTodoUseCase");
	}

	public getCreateDailyUseCase(): CreateDailyUseCase {
		return this.useCases.get("createDailyUseCase");
	}

	public getListDailiesUseCase(): ListDailiesUseCase {
		return this.useCases.get("listDailiesUseCase");
	}

	public getUpdateDailyUseCase(): UpdateDailyUseCase {
		return this.useCases.get("updateDailyUseCase");
	}

	public getDeleteDailyUseCase(): DeleteDailyUseCase {
		return this.useCases.get("deleteDailyUseCase");
	}

	public getToggleCompleteDailyUseCase(): ToggleCompleteDailyUseCase {
		return this.useCases.get("toggleCompleteDailyUseCase");
	}

	public getCreateTagUseCase(): CreateTagUseCase {
		return this.useCases.get("createTagUseCase");
	}

	public getListTagsUseCase(): ListTagsUseCase {
		return this.useCases.get("listTagsUseCase");
	}

	public getUpdateTagUseCase(): UpdateTagUseCase {
		return this.useCases.get("updateTagUseCase");
	}

	public getDeleteTagUseCase(): DeleteTagUseCase {
		return this.useCases.get("deleteTagUseCase");
	}

	public getCreateGoalUseCase(): CreateGoalUseCase {
		return this.useCases.get("createGoalUseCase");
	}

	public getListGoalsUseCase(): ListGoalsUseCase {
		return this.useCases.get("listGoalsUseCase");
	}
}

// Export singleton instance
export const container = DIContainer.getInstance();