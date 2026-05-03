import { getTodayDateInSaoPaulo } from "@/lib/date-utils";

type TodoTypeLike = "pontual" | "recorrente" | { isPontual?: () => boolean; isRecorrente?: () => boolean };

export interface TodoRecurrenceLike {
    recurrence: "none" | "daily" | "weekly" | "monthly" | "custom";
    recurrenceInterval?: number;
    lastCompletedDate?: string;
    todoType?: TodoTypeLike;
}

function diffDays(olderIso: string, newerIso: string): number {
    const older = new Date(`${olderIso}T00:00:00`);
    const newer = new Date(`${newerIso}T00:00:00`);
    return Math.floor((newer.getTime() - older.getTime()) / (1000 * 60 * 60 * 24));
}

export function isCompletedInCurrentRecurrencePeriod(
    todo: TodoRecurrenceLike,
    todayIso: string = getTodayDateInSaoPaulo(),
): boolean {
    if (!todo.lastCompletedDate) return false;

    // Tarefas sem recorrência permanecem concluídas após execução.
    // Para evitar travar diárias em dados antigos inconsistentes,
    // priorizamos a recorrência sobre o todoType.
    if (todo.recurrence === "none") {
        return true;
    }

    switch (todo.recurrence) {
        case "daily":
            return todo.lastCompletedDate === todayIso;
        case "weekly":
            return diffDays(todo.lastCompletedDate, todayIso) < 7;
        case "monthly": {
            const last = new Date(`${todo.lastCompletedDate}T00:00:00`);
            const today = new Date(`${todayIso}T00:00:00`);
            return last.getFullYear() === today.getFullYear() && last.getMonth() === today.getMonth();
        }
        case "custom": {
            const interval = todo.recurrenceInterval ?? 1;
            return diffDays(todo.lastCompletedDate, todayIso) < interval;
        }
        default:
            return false;
    }
}

export function shouldReopenForNextRecurrencePeriod(
    todo: TodoRecurrenceLike,
    todayIso: string = getTodayDateInSaoPaulo(),
): boolean {
    if (!todo.lastCompletedDate) return false;
    if (todo.recurrence === "none") return false;
    return !isCompletedInCurrentRecurrencePeriod(todo, todayIso);
}

export function isTodoPendingForToday(
    todo: TodoRecurrenceLike,
    todayIso: string = getTodayDateInSaoPaulo(),
): boolean {
    return !isCompletedInCurrentRecurrencePeriod(todo, todayIso);
}
