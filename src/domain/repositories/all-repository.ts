import type { CreateHabitPeriodData, HabitPeriod, UpdateHabitPeriodData } from "../entities/habit-period";
import type {
	BaseRepository,
	CompletableRepository,
	LogRepository,
	OrderableRepository,
	SubtaskRepository,
	TaggableRepository,
	UserOwnedRepository,
} from "./base-repository";

import type { Habit } from "../entities/habit";
import type { HabitLog } from "../entities/habit-log";
import type { Tag } from "../entities/tag";
import type { Todo } from "../entities/todo";
import type { TodoLog } from "../entities/todo-log";
import type { TodoSubtask } from "../entities/todo-subtask";
import type { UserConfig } from "../entities/user-config";

// Habit repository with user ownership, completion, ordering, and tagging
export interface HabitRepository
	extends UserOwnedRepository<Habit>,
	CompletableRepository<Habit>,
	OrderableRepository<Habit>,
	TaggableRepository<Habit> { }

// Habit log repository
export interface HabitLogRepository extends LogRepository<HabitLog> { } // tslint-disable-line @typescript-eslint/no-unused-vars

// Tag repository with user ownership
export interface TagRepository extends UserOwnedRepository<Tag> { } // tslint-disable-line @typescript-eslint/no-unused-vars

// Todo repository with user ownership, completion, ordering, and tagging
export interface TodoRepository
	extends UserOwnedRepository<Todo>,
	CompletableRepository<Todo>,
	OrderableRepository<Todo>,
	TaggableRepository<Todo> { }

// Todo log repository
export interface TodoLogRepository extends LogRepository<TodoLog> { } // tslint-disable-line @typescript-eslint/no-unused-vars

// Todo subtask repository
export interface TodoSubtaskRepository
	extends SubtaskRepository<TodoSubtask>,
	OrderableRepository<TodoSubtask> {
	listByTodoId(todoId: string): Promise<TodoSubtask[]>;
}

// User config repository
export interface UserConfigRepository extends BaseRepository<UserConfig> {
	findByUserId(userId: string): Promise<UserConfig | null>;
	upsert(userId: string, config: Partial<Omit<UserConfig, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<UserConfig>;
}

export interface HabitPeriodRepository {
	findActiveByHabitId(habitId: string): Promise<HabitPeriod | null>;
	findByHabitId(habitId: string): Promise<HabitPeriod[]>;
	findById(id: string): Promise<HabitPeriod | null>;
	create(data: CreateHabitPeriodData): Promise<HabitPeriod>;
	update(id: string, data: UpdateHabitPeriodData): Promise<HabitPeriod>;
	finalizePeriod(id: string): Promise<HabitPeriod>;
	incrementCount(id: string): Promise<HabitPeriod>;
	findPeriodsToFinalize(): Promise<HabitPeriod[]>;
}
