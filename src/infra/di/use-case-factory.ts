import { GetActiveTasksUseCase } from "@/application/use-cases/task/get-active-tasks/get-active-tasks-use-case";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";

const habitRepository = new PrismaHabitRepository();
const todoRepository = new PrismaTodoRepository();

export class UseCaseFactory {
  static createGetActiveTasksUseCase(): GetActiveTasksUseCase {
    return new GetActiveTasksUseCase(
      habitRepository,
      todoRepository
    );
  }
}
