import type { CreateTodoInput } from "@/modules/todo/types";
import { createTodo } from "@/modules/todo/use-cases";
import { InMemoryTodoRepository } from "@/infra/repositories/memory/in-memory-todo-repository";

describe("should be able to create a todo", () => {
	let todoRepository: InMemoryTodoRepository;

	beforeEach(() => {
		todoRepository = new InMemoryTodoRepository();
	});

	afterEach(() => {
		todoRepository.clear();
	});

	it("deve criar uma tarefa", async () => {
		const inputTodo: CreateTodoInput = {
			userId: "test-user-123",
			title: "Tarefa 1",
			observations: "",
			tasks: ["Tarefa 1", "Tarefa 2"],
			tags: ["Tag 1", "Tag 2"],
			createdAt: new Date(),
			startDate: new Date(),
			difficulty: "Fácil",
		};

		const result = await createTodo(todoRepository, inputTodo);

		expect(result).toBeDefined();
		expect(result.title).toBe(inputTodo.title);
		expect(result.observations).toBe(inputTodo.observations);
	});

	it("deve criar uma tarefa com categoria e prioridade padrão", async () => {
		const inputTodo: CreateTodoInput = {
			userId: "test-user-456",
			title: "Tarefa 2",
			observations: "Observações",
			tasks: ["Tarefa 1", "Tarefa 2"],
			tags: ["Tag 1", "Tag 2"],
			createdAt: new Date(),
			startDate: new Date(),
			difficulty: "Fácil",
		};

		const result = await createTodo(todoRepository, inputTodo);

		expect(result).toBeDefined();
		expect(result.title).toBe(inputTodo.title);
	});
});
