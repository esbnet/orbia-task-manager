import { GetActiveTasksUseCase } from "@/application/use-cases/task/get-active-tasks/get-active-tasks-use-case";
import { GetAvailableDailiesUseCase } from "@/application/use-cases/daily/get-available-dailies/get-available-dailies-use-case";
import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily/delete-daily-use-case";
import { VerifyTodoOwnershipUseCase } from "@/application/use-cases/todo-subtask/verify-todo-ownership-use-case";
import { container } from "./container";

export class UseCaseFactory {
  static createGetActiveTasksUseCase(): GetActiveTasksUseCase {
    return new GetActiveTasksUseCase(
      container.getHabitRepository(),
      container.getDailyRepository(),
      container.getTodoRepository()
    );
  }

  static createGetAvailableDailiesUseCase(): GetAvailableDailiesUseCase {
    return new GetAvailableDailiesUseCase(
      container.getDailyRepository(),
      container.getDailyLogRepository()
    );
  }

  static createDeleteDailyUseCase(): DeleteDailyUseCase {
    return new DeleteDailyUseCase(
      container.getDailyRepository()
    );
  }

  static createVerifyTodoOwnershipUseCase(): VerifyTodoOwnershipUseCase {
    return new VerifyTodoOwnershipUseCase(
      container.getTodoRepository()
    );
  }
}