import type { Todo } from "@/domain/entities/todo";

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority: Todo["priority"];
  tags: string[];
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string;
  priority?: Todo["priority"];
  tags?: string[];
  isCompleted?: boolean;
}

export class TodoInputValidator {
  static validateCreateInput(input: any): CreateTodoInput {
    if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
      throw new Error('Title is required and must be a non-empty string');
    }

    if (input.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }

    if (input.description && typeof input.description !== 'string') {
      throw new Error('Description must be a string');
    }

    if (input.description && input.description.length > 1000) {
      throw new Error('Description must be less than 1000 characters');
    }

    const validPriorities = ['Baixa', 'Média', 'Alta'];
    if (!input.priority || !validPriorities.includes(input.priority)) {
      throw new Error('Priority must be one of: Baixa, Média, Alta');
    }

    if (!Array.isArray(input.tags)) {
      throw new Error('Tags must be an array');
    }

    // Sanitize tags
    const sanitizedTags = input.tags
      .filter((tag: any) => typeof tag === 'string' && tag.trim().length > 0)
      .map((tag: string) => tag.trim().substring(0, 50));

    return {
      title: input.title.trim(),
      description: input.description?.trim(),
      priority: input.priority,
      tags: sanitizedTags,
    };
  }

  static validateUpdateInput(input: any): UpdateTodoInput {
    if (!input.id || typeof input.id !== 'string') {
      throw new Error('ID is required and must be a string');
    }

    const validated: UpdateTodoInput = { id: input.id };

    if (input.title !== undefined) {
      if (typeof input.title !== 'string' || input.title.trim().length === 0) {
        throw new Error('Title must be a non-empty string');
      }
      if (input.title.length > 200) {
        throw new Error('Title must be less than 200 characters');
      }
      validated.title = input.title.trim();
    }

    if (input.description !== undefined) {
      if (typeof input.description !== 'string') {
        throw new Error('Description must be a string');
      }
      if (input.description.length > 1000) {
        throw new Error('Description must be less than 1000 characters');
      }
      validated.description = input.description.trim();
    }

    if (input.priority !== undefined) {
      const validPriorities = ['Baixa', 'Média', 'Alta'];
      if (!validPriorities.includes(input.priority)) {
        throw new Error('Priority must be one of: Baixa, Média, Alta');
      }
      validated.priority = input.priority;
    }

    if (input.tags !== undefined) {
      if (!Array.isArray(input.tags)) {
        throw new Error('Tags must be an array');
      }
      validated.tags = input.tags
        .filter((tag: any) => typeof tag === 'string' && tag.trim().length > 0)
        .map((tag: string) => tag.trim().substring(0, 50));
    }

    if (input.isCompleted !== undefined) {
      if (typeof input.isCompleted !== 'boolean') {
        throw new Error('isCompleted must be a boolean');
      }
      validated.isCompleted = input.isCompleted;
    }

    return validated;
  }
}