import { getTodayDateInSaoPaulo } from "@/lib/date-utils";
import { getTodoOverdueOccurrences, isTodoPendingForToday } from "@/lib/todo-recurrence";
import { listTodos, toggleTodo } from "@/modules/todo/use-cases";

interface TestTodo {
    id: string;
    userId: string;
    title: string;
    observations: string;
    tasks: string[];
    difficulty: string;
    startDate: Date;
    tags: string[];
    createdAt: Date;
    recurrence: string;
    recurrenceInterval?: number;
    todoType: string;
    lastCompletedDate?: string;
    lastCompletedAt?: Date;
}

interface TestTodoLogCreateData {
    todoId: string;
    todoTitle: string;
    difficulty: string;
    tags: string[];
    completedAt: Date;
}

function makeTodo(overrides: Partial<TestTodo> = {}): TestTodo {
    return {
        id: "todo-1",
        userId: "user-1",
        title: "Tarefa recorrente",
        observations: "",
        tasks: [],
        difficulty: "Fácil",
        startDate: new Date(),
        tags: [],
        createdAt: new Date(),
        recurrence: "daily",
        todoType: "recorrente",
        ...overrides,
    };
}

function makeRepo(seed: TestTodo[]) {
    let data = [...seed];

    return {
        async list() {
            return [...data];
        },
        async findById(id: string) {
            return data.find((t) => t.id === id) ?? null;
        },
        async findByUserId(userId: string) {
            return data.filter((t) => t.userId === userId);
        },
        async create(todo) {
            const created = { ...todo, id: "new-id", createdAt: new Date() };
            data.push(created);
            return created;
        },
        async update(todo) {
            data = data.map((t) => (t.id === todo.id ? todo : t));
            return todo;
        },
        async delete(id: string) {
            data = data.filter((t) => t.id !== id);
        },
        async toggleComplete(id: string) {
            const current = data.find((t) => t.id === id);
            if (!current) throw new Error("Todo not found");
            const toggled: TestTodo = {
                ...current,
                lastCompletedDate: current.lastCompletedDate ? undefined : getTodayDateInSaoPaulo(),
                lastCompletedAt: current.lastCompletedDate ? undefined : new Date(),
            };
            data = data.map((t) => (t.id === id ? toggled : t));
            return toggled;
        },
        async markComplete(id: string) {
            const current = data.find((t) => t.id === id);
            if (!current) throw new Error("Todo not found");
            const completed: TestTodo = {
                ...current,
                lastCompletedDate: getTodayDateInSaoPaulo(),
                lastCompletedAt: new Date(),
            };
            data = data.map((t) => (t.id === id ? completed : t));
            return completed;
        },
        async markIncomplete(id: string) {
            const current = data.find((t) => t.id === id);
            if (!current) throw new Error("Todo not found");
            const reopened: TestTodo = {
                ...current,
                lastCompletedDate: undefined,
                lastCompletedAt: undefined,
            };
            data = data.map((t) => (t.id === id ? reopened : t));
            return reopened;
        },
        async reorder() {
            return;
        },
    };
}

function makeLogRepo(storage: TestTodoLogCreateData[]) {
    return {
        async create(data) {
            storage.push(data);
            return { id: String(storage.length), ...data };
        },
    };
}

describe("todo recurrence flow", () => {
    it("redisponibiliza tarefa recorrente no novo período ao listar", async () => {
        const repo = makeRepo([
            makeTodo({
                recurrence: "daily",
                startDate: new Date("2024-01-01T12:00:00.000Z"),
                lastCompletedDate: "2024-01-01",
                lastCompletedAt: new Date("2024-01-01T12:00:00.000Z"),
            }),
        ]);

        const todos = await listTodos(repo);

        expect(todos[0].lastCompletedDate).toBeUndefined();
        expect(todos[0].lastCompletedAt).toBeUndefined();
    });

    it("registra histórico ao completar tarefa recorrente", async () => {
        const repo = makeRepo([
            makeTodo({
                recurrence: "daily",
                startDate: new Date("2024-01-01T12:00:00.000Z"),
                lastCompletedDate: "2024-01-01",
            }),
        ]);
        const logs: TestTodoLogCreateData[] = [];
        const logRepo = makeLogRepo(logs);

        const updated = await toggleTodo(repo, logRepo, "todo-1");

        expect(logs).toHaveLength(1);
        expect(updated.lastCompletedDate).toBe(getTodayDateInSaoPaulo());
    });

    it("permite desmarcar no mesmo período sem criar log duplicado", async () => {
        const today = getTodayDateInSaoPaulo();
        const repo = makeRepo([
            makeTodo({
                recurrence: "daily",
                lastCompletedDate: today,
                lastCompletedAt: new Date(),
            }),
        ]);
        const logs: TestTodoLogCreateData[] = [];
        const logRepo = makeLogRepo(logs);

        const updated = await toggleTodo(repo, logRepo, "todo-1");

        expect(logs).toHaveLength(0);
        expect(updated.lastCompletedDate).toBeUndefined();
    });

    it("exibe tarefa semanal somente no dia agendado", () => {
        const weeklyTodo = makeTodo({
            recurrence: "weekly",
            startDate: new Date("2026-05-07T12:00:00.000Z"), // quinta-feira
            lastCompletedDate: undefined,
        });

        expect(isTodoPendingForToday(weeklyTodo, "2026-05-07")).toBe(true);
        expect(isTodoPendingForToday(weeklyTodo, "2026-05-08")).toBe(false);
        expect(isTodoPendingForToday(weeklyTodo, "2026-05-14")).toBe(true);
    });

    it("calcula ocorrências em atraso para tarefa semanal", () => {
        const weeklyTodo = makeTodo({
            recurrence: "weekly",
            startDate: new Date("2026-04-02T12:00:00.000Z"),
            lastCompletedDate: "2026-04-02",
        });

        expect(getTodoOverdueOccurrences(weeklyTodo, "2026-04-23")).toBe(2);
        expect(isTodoPendingForToday(weeklyTodo, "2026-04-23")).toBe(true);
    });

    it("não conta atraso quando tarefa recorrente é reaberta sem histórico (lastCompletedDate null)", () => {
        const reopenedWeekly = makeTodo({
            recurrence: "weekly",
            startDate: new Date("2026-04-02T12:00:00.000Z"),
            lastCompletedDate: undefined,
        });

        // Sem lastCompletedDate, não há período confirmado como perdido.
        expect(getTodoOverdueOccurrences(reopenedWeekly, "2026-05-07")).toBe(0);
    });

    it("calcula ocorrências em atraso para tarefa diária", () => {
        const dailyTodo = makeTodo({
            recurrence: "daily",
            startDate: new Date("2026-05-01T12:00:00.000Z"),
            lastCompletedDate: "2026-05-01",
        });

        expect(getTodoOverdueOccurrences(dailyTodo, "2026-05-05")).toBe(3);
        expect(isTodoPendingForToday(dailyTodo, "2026-05-05")).toBe(true);
    });
});
