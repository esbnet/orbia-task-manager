import { GetActiveTasksUseCase } from "@/application/use-cases/task/get-active-tasks/get-active-tasks-use-case";
import { container } from "./container";

export class UseCaseFactory {
  static createGetActiveTasksUseCase(): GetActiveTasksUseCase {
    return new GetActiveTasksUseCase(
      container.getHabitRepository(),
      container.getTodoRepository()
    );
  }
}
