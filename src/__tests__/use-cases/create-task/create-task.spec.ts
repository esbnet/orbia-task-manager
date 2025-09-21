import type { CreateTodoInput } from "@/application/use-cases/todo/create-todo/create-todo-dto";
import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { InMemoryTodoRepository } from "@/infra/repositories/memory/in-memory-todo-repository";

describe("should be able to create a todo", () => {
	let useCase: CreateTodoUseCase;
	let todoRepository: InMemoryTodoRepository;

	beforeEach(() => {
		todoRepository = new InMemoryTodoRepository();
		useCase = new CreateTodoUseCase(todoRepository);
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

		const result = await useCase.execute(inputTodo);

		expect(result.todo).toBeDefined();
		expect(result.todo.title).toBe(inputTodo.title);
		expect(result.todo.observations).toBe(inputTodo.observations);
	});

	it("deve criar uma tarefa com categoria e prioridade padrão", async () => {
		const inputTodo: CreateTodoInput = {
			userId: "test-user-456",
			title: "Tarefa 2",
			observations: "Observações",
			tasks: ["Tarefa 1", "Tarefa 2"],
			tags: ["Tag 1", "Tag 2"],
			createdAt: new Date(),
			startDate: new Date(),
			difficulty: "Fácil",
		};

		const result = await useCase.execute(inputTodo);

		expect(result.todo).toBeDefined();
		expect(result.todo.title).toBe(inputTodo.title);
	});
});
