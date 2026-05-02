/**
 * Adaptadores internos: converte entre domain entity (com TodoTypeValueObject)
 * e o tipo canônico do módulo (com string simples).
 * Arquivo interno — não exportar fora do módulo.
 */

import type { Todo as DomainTodo } from "@/domain/entities/todo";
import { TodoTypeValueObject } from "@/domain/value-objects/todo-type";
import type { Todo } from "./types";

export function fromDomain(d: DomainTodo): Todo {
    return {
        id: d.id,
        userId: d.userId,
        title: d.title,
        observations: d.observations,
        tasks: d.tasks,
        difficulty: d.difficulty as Todo["difficulty"],
        startDate: d.startDate,
        tags: d.tags,
        createdAt: d.createdAt,
        order: d.order,
        lastCompletedDate: d.lastCompletedDate,
        lastCompletedAt: d.lastCompletedAt,
        recurrence: d.recurrence as Todo["recurrence"],
        recurrenceInterval: d.recurrenceInterval,
        todoType: d.todoType.getValue() as Todo["todoType"],
        subtasks: d.subtasks,
    };
}

export function toDomain(t: Todo): DomainTodo {
    return {
        ...t,
        difficulty: t.difficulty as DomainTodo["difficulty"],
        recurrence: t.recurrence as DomainTodo["recurrence"],
        todoType: TodoTypeValueObject.create(t.todoType),
    };
}
