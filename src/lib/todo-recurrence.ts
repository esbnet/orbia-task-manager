import { getTodayDateInSaoPaulo } from "@/lib/date-utils";

type TodoTypeLike = "pontual" | "recorrente" | { isPontual?: () => boolean; isRecorrente?: () => boolean };

export interface TodoRecurrenceLike {
    recurrence: "none" | "daily" | "weekly" | "monthly" | "custom";
    recurrenceInterval?: number;
    lastCompletedDate?: string;
    startDate?: Date | string;
    todoType?: TodoTypeLike;
}

function diffDays(olderIso: string, newerIso: string): number {
    const older = new Date(`${olderIso}T00:00:00`);
    const newer = new Date(`${newerIso}T00:00:00`);
    return Math.floor((newer.getTime() - older.getTime()) / (1000 * 60 * 60 * 24));
}

function toIsoDateInSaoPaulo(date: Date | string): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(date));
}

function addDaysToIsoDate(isoDate: string, days: number): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    const base = new Date(Date.UTC(year, month - 1, day));
    base.setUTCDate(base.getUTCDate() + days);
    return base.toISOString().slice(0, 10);
}

function addMonthsToIsoDate(isoDate: string, months: number): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    const base = new Date(Date.UTC(year, month - 1, day));
    base.setUTCMonth(base.getUTCMonth() + months);
    return base.toISOString().slice(0, 10);
}

function getStartDateIso(todo: TodoRecurrenceLike): string {
    if (todo.startDate) return toIsoDateInSaoPaulo(todo.startDate);
    if (todo.lastCompletedDate) return todo.lastCompletedDate;
    return getTodayDateInSaoPaulo();
}

function getIntervalInDays(todo: TodoRecurrenceLike): number {
    switch (todo.recurrence) {
        case "daily":
            return 1;
        case "weekly":
            return 7;
        case "custom":
            return Math.max(1, todo.recurrenceInterval ?? 1);
        default:
            return 1;
    }
}

function isTodayScheduled(todo: TodoRecurrenceLike, todayIso: string): boolean {
    const startIso = getStartDateIso(todo);
    const daysFromStart = diffDays(startIso, todayIso);

    if (daysFromStart < 0) return false;

    switch (todo.recurrence) {
        case "none":
            return true;
        case "daily":
            return true;
        case "weekly":
            return daysFromStart % 7 === 0;
        case "custom": {
            const interval = Math.max(1, todo.recurrenceInterval ?? 1);
            return daysFromStart % interval === 0;
        }
        case "monthly": {
            const [startYear, startMonth, startDay] = startIso.split("-").map(Number);
            const [todayYear, todayMonth, todayDay] = todayIso.split("-").map(Number);

            const monthsFromStart = (todayYear - startYear) * 12 + (todayMonth - startMonth);
            if (monthsFromStart < 0) return false;

            const daysInCurrentMonth = new Date(Date.UTC(todayYear, todayMonth, 0)).getUTCDate();
            const expectedDay = Math.min(startDay, daysInCurrentMonth);
            return todayDay === expectedDay;
        }
        default:
            return false;
    }
}

function getNextDueDateIso(todo: TodoRecurrenceLike): string | null {
    const startIso = getStartDateIso(todo);

    if (todo.recurrence === "none") {
        return todo.lastCompletedDate ? null : startIso;
    }

    if (!todo.lastCompletedDate) return startIso;

    switch (todo.recurrence) {
        case "daily":
            return addDaysToIsoDate(todo.lastCompletedDate, 1);
        case "weekly":
            return addDaysToIsoDate(todo.lastCompletedDate, 7);
        case "monthly":
            return addMonthsToIsoDate(todo.lastCompletedDate, 1);
        case "custom":
            return addDaysToIsoDate(todo.lastCompletedDate, Math.max(1, todo.recurrenceInterval ?? 1));
        default:
            return startIso;
    }
}

function countMonthlyOccurrencesBefore(startIso: string, endIso: string): number {
    let count = 0;
    let cursor = startIso;

    while (cursor < endIso) {
        count += 1;
        cursor = addMonthsToIsoDate(cursor, 1);
    }

    return count;
}

export function getTodoOverdueOccurrences(
    todo: TodoRecurrenceLike,
    todayIso: string = getTodayDateInSaoPaulo(),
): number {
    const nextDueIso = getNextDueDateIso(todo);
    if (!nextDueIso || todayIso <= nextDueIso) return 0;

    if (todo.recurrence === "none") {
        return 1;
    }

    // Tarefas recorrentes sem lastCompletedDate não possuem histórico de conclusão:
    // podem ser novas ou ter sido reabertas pelo início de um novo período.
    // Sem histórico confirmado de período perdido, não exibimos atraso.
    if (!todo.lastCompletedDate) return 0;

    if (todo.recurrence === "monthly") {
        return countMonthlyOccurrencesBefore(nextDueIso, todayIso);
    }

    const interval = getIntervalInDays(todo);
    const daysLate = diffDays(nextDueIso, todayIso);
    return Math.floor(daysLate / interval);
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

    if (!isTodayScheduled(todo, todayIso)) return false;

    return todo.lastCompletedDate === todayIso;
}

export function shouldReopenForNextRecurrencePeriod(
    todo: TodoRecurrenceLike,
    todayIso: string = getTodayDateInSaoPaulo(),
): boolean {
    if (!todo.lastCompletedDate) return false;
    if (todo.recurrence === "none") return false;

    const nextDueIso = getNextDueDateIso(todo);
    if (!nextDueIso) return false;

    return nextDueIso <= todayIso;
}

export function isTodoPendingForToday(
    todo: TodoRecurrenceLike,
    todayIso: string = getTodayDateInSaoPaulo(),
): boolean {
    if (todo.recurrence === "none") {
        const startIso = getStartDateIso(todo);
        return !todo.lastCompletedDate && todayIso >= startIso;
    }

    if (!isTodayScheduled(todo, todayIso)) return false;

    const nextDueIso = getNextDueDateIso(todo);
    if (!nextDueIso) return false;

    return todayIso >= nextDueIso;
}
