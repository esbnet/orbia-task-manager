/**
 * TodoModule — Application Facade do módulo Todo.
 *
 * Substitui: UseCaseFactory.createXxxTodoUseCase().execute(input)
 * Por: TodoModule.xxx(input)
 *
 * As rotas de API chamam este módulo diretamente.
 * Regras de negócio vivem em ./use-cases.ts.
 * Tipos canônicos em ./types.ts.
 *
 * Alterar qualquer regra de Todo = max 2 arquivos (use-cases.ts + types.ts).
 */

import { TodoTypeValueObject } from "@/domain/value-objects/todo-type";
import { PrismaTodoLogRepository } from "@/infra/database/prisma/prisma-todo-log-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";
import { fromDomain, toDomain } from "./adapters";
import type { TodoLog, TodoLogRepository, TodoRepository } from "./repository";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "./types";
import {
    completePontual,
    completeTodoWithLog,
    createCompletionLog,
    createTodo,
    deleteTodo,
    listTodos,
    toggleTodo,
    updateTodo,
} from "./use-cases";

// ---- Repositórios (singletons do módulo) ----

const _todoRepo = new PrismaTodoRepository();
const _todoLogRepo = new PrismaTodoLogRepository();

/**
 * Adapta PrismaTodoRepository (retorna DomainTodo) para a interface
 * TodoRepository do módulo (retorna Todo canônico com string todoType).
 */
const todoRepo: TodoRepository = {
    async list() {
        return (await _todoRepo.list()).map(fromDomain);
    },
    async findById(id) {
        const d = await _todoRepo.findById(id);
        return d ? fromDomain(d) : null;
    },
    async findByUserId(userId) {
        return (await _todoRepo.findByUserId(userId)).map(fromDomain);
    },
    async create(data) {
        const d = await _todoRepo.create({
            ...data,
            todoType: TodoTypeValueObject.create(data.todoType),
        });
        return fromDomain(d);
    },
    async update(todo) {
        const d = await _todoRepo.update(toDomain(todo));
        return fromDomain(d);
    },
    async delete(id) {
        return _todoRepo.delete(id);
    },
    async toggleComplete(id) {
        return fromDomain(await _todoRepo.toggleComplete(id));
    },
    async markComplete(id) {
        return fromDomain(await _todoRepo.markComplete(id));
    },
    async markIncomplete(id) {
        return fromDomain(await _todoRepo.markIncomplete(id));
    },
    async reorder(ids) {
        return _todoRepo.reorder(ids);
    },
};

const todoLogRepo: TodoLogRepository = {
    async create(data) {
        return _todoLogRepo.create(data) as Promise<TodoLog>;
    },
};

// ---- Facade ----

export const TodoModule = {
    /** Lista todas as tarefas do usuário autenticado. */
    list(): Promise<Todo[]> {
        return listTodos(todoRepo);
    },

    /** Cria uma nova tarefa. */
    create(input: CreateTodoInput): Promise<Todo> {
        return createTodo(todoRepo, input);
    },

    /** Atualiza campos de uma tarefa existente. */
    update(input: UpdateTodoInput): Promise<Todo> {
        return updateTodo(todoRepo, input);
    },

    /** Remove uma tarefa. */
    delete(id: string): Promise<void> {
        return deleteTodo(todoRepo, id);
    },

    /**
     * Alterna estado de conclusão (recorrente).
     * Cria log ao completar.
     */
    toggle(id: string): Promise<Todo> {
        return toggleTodo(todoRepo, todoLogRepo, id);
    },

    /**
     * Completa tarefa pontual (irreversível).
     * Cria log e define lastCompletedDate.
     */
    completePontual(id: string): Promise<{ todo: Todo; log: TodoLog }> {
        return completePontual(todoRepo, todoLogRepo, id);
    },

    /**
     * Completa tarefa recorrente com log (chamado pela coluna de tasks).
     */
    completeWithLog(todo: Todo): Promise<Todo> {
        return completeTodoWithLog(todoRepo, todoLogRepo, todo);
    },

    createLog(todo: Todo): Promise<TodoLog> {
        return createCompletionLog(todoLogRepo, todo);
    },
};

// ---- Exportações públicas do módulo ----

export type { TodoLog, TodoLogRepository, TodoRepository } from "./repository";
export type { CreateTodoInput, Todo, TodoDifficulty, TodoRecurrence, TodoSubtask, TodoType, UpdateTodoInput } from "./types";

