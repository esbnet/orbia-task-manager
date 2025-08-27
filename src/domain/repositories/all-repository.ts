import type {
    CompletableRepository,
    LogRepository,
    OrderableRepository,
    SubtaskRepository,
    TaggableRepository,
    UserOwnedRepository,
} from "./base-repository";

import type { Daily } from "../entities/daily";
import type { DailyLog } from "../entities/daily-log";
import type { DailySubtask } from "../entities/daily-subtask";
import type { Habit } from "../entities/habit";
import type { HabitLog } from "../entities/habit-log";
import type { Tag } from "../entities/tag";
import type { Todo } from "../entities/todo";
import type { TodoLog } from "../entities/todo-log";
import type { TodoSubtask } from "../entities/todo-subtask";

// Daily repository with user ownership, completion, ordering, and tagging
export interface DailyRepository
	extends UserOwnedRepository<Daily>,
		CompletableRepository<Daily>,
		OrderableRepository<Daily>,
		TaggableRepository<Daily> {}

// Daily log repository
export interface DailyLogRepository extends LogRepository<DailyLog> {}

// Daily subtask repository
export interface DailySubtaskRepository extends SubtaskRepository<DailySubtask> {
	listByDailyId(dailyId: string): Promise<DailySubtask[]>;
}

// Habit repository with user ownership, completion, ordering, and tagging
export interface HabitRepository
	extends UserOwnedRepository<Habit>,
		CompletableRepository<Habit>,
		OrderableRepository<Habit>,
		TaggableRepository<Habit> {}

// Habit log repository
export interface HabitLogRepository extends LogRepository<HabitLog> {}

// Tag repository with user ownership
export interface TagRepository extends UserOwnedRepository<Tag> {}

// Todo repository with user ownership, completion, ordering, and tagging
export interface TodoRepository
	extends UserOwnedRepository<Todo>,
		CompletableRepository<Todo>,
		OrderableRepository<Todo>,
		TaggableRepository<Todo> {}

// Todo log repository
export interface TodoLogRepository extends LogRepository<TodoLog> {}

// Todo subtask repository
export interface TodoSubtaskRepository extends SubtaskRepository<TodoSubtask> {
	listByTodoId(todoId: string): Promise<TodoSubtask[]>;
}
