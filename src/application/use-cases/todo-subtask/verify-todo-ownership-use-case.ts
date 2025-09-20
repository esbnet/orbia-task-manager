import type { TodoRepository } from "@/domain/repositories/todo-repository";

export interface VerifyTodoOwnershipInput {
  todoId: string;
  userId: string;
}

export class VerifyTodoOwnershipUseCase {
  constructor(private todoRepository: TodoRepository) {}

  async execute(input: VerifyTodoOwnershipInput): Promise<boolean> {
    const { todoId, userId } = input;
    
    try {
      const todo = await this.todoRepository.findById(todoId);
      return todo?.userId === userId;
    } catch {
      return false;
    }
  }
}