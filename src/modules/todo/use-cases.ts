/**
 * Use cases do módulo Todo — consolidados em um único arquivo.
 *
 * Antes: 8 diretórios × 2 arquivos = 16 arquivos para navegar.
 * Agora: 1 arquivo com todas as operações do módulo.
 */

import { getTodayDateInSaoPaulo } from "@/lib/date-utils";
import {
    isCompletedInCurrentRecurrencePeriod,
    shouldReopenForNextRecurrencePeriod,
} from "@/lib/todo-recurrence";
import type { TodoLog, TodoLogRepository, TodoRepository } from "./repository";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "./types";

function resolveTodoType(
    recurrence: CreateTodoInput["recurrence"] | UpdateTodoInput["recurrence"],
    todoType?: CreateTodoInput["todoType"] | UpdateTodoInput["todoType"],
): "pontual" | "recorrente" {
    // Recorrências diferentes de "none" devem ser recorrentes.
    if (recurrence && recurrence !== "none") return "recorrente";
    return todoType ?? "pontual";
}

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
    const todos = await repo.list();
    const today = getTodayDateInSaoPaulo();

    // Redisponibiliza tarefas recorrentes no início do novo período.
    const normalized = await Promise.all(
        todos.map(async (todo) => {
            if (shouldReopenForNextRecurrencePeriod(todo, today)) {
                return repo.markIncomplete(todo.id);
            }
            return todo;
        }),
    );

    return normalized;
}

// ---- Create ----

export async function createTodo(
    repo: TodoRepository,
    input: CreateTodoInput,
): Promise<Todo> {
    const recurrence = input.recurrence ?? "none";

    return repo.create({
        userId: input.userId,
        title: input.title,
        observations: input.observations,
        tasks: input.tasks,
        difficulty: input.difficulty,
        startDate: input.startDate,
        tags: input.tags,
        recurrence,
        recurrenceInterval: input.recurrenceInterval,
        todoType: resolveTodoType(recurrence, input.todoType),
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
        todoType: resolveTodoType(input.recurrence, input.todoType),
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

    const today = getTodayDateInSaoPaulo();
    const isCompletedInCurrentPeriod = isCompletedInCurrentRecurrencePeriod(current, today);

    // Se já está concluída no período atual, desmarca.
    if (isCompletedInCurrentPeriod) {
        return repo.markIncomplete(id);
    }

    // Conclusão nova no período atual: registra histórico e marca conclusão.
    await logRepo.create({
        todoId: current.id,
        todoTitle: current.title,
        difficulty: current.difficulty,
        tags: current.tags,
        completedAt: new Date(),
    });

    return repo.update({
        ...current,
        lastCompletedDate: today,
        lastCompletedAt: new Date(),
    });
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
    const today = getTodayDateInSaoPaulo();
    if (isCompletedInCurrentRecurrencePeriod(todo, today)) {
        return todo;
    }

    await logRepo.create({
        todoId: todo.id,
        todoTitle: todo.title,
        difficulty: todo.difficulty,
        tags: todo.tags,
        completedAt: new Date(),
    });

    return repo.update({
        ...todo,
        lastCompletedDate: today,
        lastCompletedAt: new Date(),
    });
}
