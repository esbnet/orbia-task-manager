import { GetAvailableHabitsUseCase } from "@/application/use-cases/habit/get-available-habits/get-available-habits-use-case";
import { MarkIncompleteHabitUseCase } from "@/application/use-cases/habit/mark-incomplete-habit/mark-incomplete-habit-use-case";
import { RegisterHabitUseCase } from "@/application/use-cases/habit/register-habit-use-case/register-habit-use-case";
import { ToggleCompleteUseCase } from "@/application/use-cases/habit/toggle-complete-habit/toggle-complete-habit-use-case";
import { GetActiveTasksUseCase } from "@/application/use-cases/task/get-active-tasks/get-active-tasks-use-case";
import { VerifyTodoOwnershipUseCase } from "@/application/use-cases/todo-subtask/verify-todo-ownership-use-case";
import { CompletePontualUseCase } from "@/application/use-cases/todo/complete-pontual/complete-pontual-use-case";
import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/delete-todo/delete-todo-use-case";
import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { ToggleTodoUseCase } from "@/application/use-cases/todo/toggle-todo/toggle-todo-use-case";
import { UpdateTodoUseCase } from "@/application/use-cases/todo/update-todo/update-todo-use-case";
import { container } from "./container";

export class UseCaseFactory {
  static createGetActiveTasksUseCase(): GetActiveTasksUseCase {
    return new GetActiveTasksUseCase(
      container.getHabitRepository(),
      container.getTodoRepository()
    );
  }

  static createGetAvailableHabitsUseCase(): GetAvailableHabitsUseCase {
    return new GetAvailableHabitsUseCase(
      container.getHabitRepository()
    );
  }

  static createRegisterHabitUseCase(): RegisterHabitUseCase {
    return new RegisterHabitUseCase(
      container.getHabitRepository(),
      container.getHabitPeriodRepository(),
      container.getHabitEntryRepository()
    );
  }

  static createToggleCompleteHabitUseCase(): ToggleCompleteUseCase {
    return new ToggleCompleteUseCase(
      container.getHabitRepository()
    );
  }

  static createListTodosUseCase(): ListTodosUseCase {
    return new ListTodosUseCase(
      container.getPrismaTodoRepository()
    );
  }

  static createCreateTodoUseCase(): CreateTodoUseCase {
    return new CreateTodoUseCase(
      container.getPrismaTodoRepository()
    );
  }

  static createUpdateTodoUseCase(): UpdateTodoUseCase {
    return new UpdateTodoUseCase(
      container.getPrismaTodoRepository()
    );
  }

  static createDeleteTodoUseCase(): DeleteTodoUseCase {
    return new DeleteTodoUseCase(
      container.getPrismaTodoRepository()
    );
  }

  static createToggleTodoUseCase(): ToggleTodoUseCase {
    return new ToggleTodoUseCase(
      container.getPrismaTodoRepository(),
      container.getTodoLogRepository()
    );
  }

  static createCompletePontualTodoUseCase(): CompletePontualUseCase {
    return new CompletePontualUseCase(
      container.getPrismaTodoRepository(),
      container.getTodoLogRepository()
    );
  }

  static createMarkIncompleteHabitUseCase(): MarkIncompleteHabitUseCase {
    return new MarkIncompleteHabitUseCase(
      container.getHabitRepository()
    );
  }

  static createVerifyTodoOwnershipUseCase(): VerifyTodoOwnershipUseCase {
    return new VerifyTodoOwnershipUseCase(
      container.getTodoRepository()
    );
  }
}
