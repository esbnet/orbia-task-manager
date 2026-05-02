/**
 * Use cases do módulo Todo — consolidados em um único arquivo.
 *
 * Antes: 8 diretórios × 2 arquivos = 16 arquivos para navegar.
 * Agora: 1 arquivo com todas as operações do módulo.
 */

import { getTodayDateInSaoPaulo } from "@/lib/date-utils";
import type { TodoLog, TodoLogRepository, TodoRepository } from "./repository";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "./types";

export async function createCompletionLog(
    logRepo: TodoLogRepository,
    todo: Todo,
): Promise<TodoLog> {
    return logRepo.create({
        todoId: todo.id,
        todoTitle: todo.title,
        difficulty: todo.difficulty,
        tags: todo.tags,
        completedAt: new Date(),
    });
}

// ---- List ----

export async function listTodos(repo: TodoRepository): Promise<Todo[]> {
    return repo.list();
}

// ---- Create ----

export async function createTodo(
    repo: TodoRepository,
    input: CreateTodoInput,
): Promise<Todo> {
    return repo.create({
        userId: input.userId,
        title: input.title,
        observations: input.observations,
        tasks: input.tasks,
        difficulty: input.difficulty,
        startDate: input.startDate,
        tags: input.tags,
        recurrence: input.recurrence ?? "none",
        recurrenceInterval: input.recurrenceInterval,
        todoType: input.todoType ?? "pontual",
    });
}

// ---- Update ----

export async function updateTodo(
    repo: TodoRepository,
    input: UpdateTodoInput,
): Promise<Todo> {
    const existing = await repo.findById(input.id);
    if (!existing) throw new Error(`Todo com ID ${input.id} não encontrado`);

    return repo.update({
        ...existing,
        title: input.title,
        observations: input.observations,
        tasks: input.tasks,
        difficulty: input.difficulty,
        startDate: input.startDate,
        tags: input.tags,
        recurrence: input.recurrence,
        recurrenceInterval: input.recurrenceInterval,
        todoType: input.todoType,
    });
}

// ---- Delete ----

export async function deleteTodo(
    repo: TodoRepository,
    id: string,
): Promise<void> {
    return repo.delete(id);
}

// ---- Toggle (recorrente: marca/desmarca para hoje) ----

export async function toggleTodo(
    repo: TodoRepository,
    logRepo: TodoLogRepository,
    id: string,
): Promise<Todo> {
    const current = await repo.findById(id);
    if (!current) throw new Error("Todo not found");

    const isCompleting = !current.lastCompletedDate;

    if (isCompleting) {
        await logRepo.create({
            todoId: current.id,
            todoTitle: current.title,
            difficulty: current.difficulty,
            tags: current.tags,
            completedAt: new Date(),
        });
    }

    return repo.toggleComplete(id);
}

// ---- Complete pontual (tarefa única, não reaparece) ----

export async function completePontual(
    repo: TodoRepository,
    logRepo: TodoLogRepository,
    id: string,
): Promise<{ todo: Todo; log: TodoLog }> {
    const current = await repo.findById(id);
    if (!current) throw new Error("Todo not found");

    if (current.todoType !== "pontual") {
        throw new Error("Esta operação é válida apenas para tarefas pontuais");
    }
    if (current.lastCompletedDate) {
        throw new Error("Tarefa já está concluída");
    }

    const log = await logRepo.create({
        todoId: current.id,
        todoTitle: current.title,
        difficulty: current.difficulty,
        tags: current.tags,
        completedAt: new Date(),
    });

    const updated = await repo.update({
        ...current,
        lastCompletedDate: getTodayDateInSaoPaulo(),
        lastCompletedAt: new Date(),
    });

    return { todo: updated, log };
}

// ---- Complete with log (recorrente: registra log + atualiza data) ----

export async function completeTodoWithLog(
    repo: TodoRepository,
    logRepo: TodoLogRepository,
    todo: Todo,
): Promise<Todo> {
    await logRepo.create({
        todoId: todo.id,
        todoTitle: todo.title,
        difficulty: todo.difficulty,
        tags: todo.tags,
        completedAt: new Date(),
    });

    return repo.update({
        ...todo,
        lastCompletedDate: getTodayDateInSaoPaulo(),
        lastCompletedAt: new Date(),
    });
}
