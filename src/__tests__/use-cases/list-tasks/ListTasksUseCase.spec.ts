import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { InMemoryTodoRepository } from "@/infra/repositories/memory/in-memory-todo-repository";

describe("Use Case: ListTodosUseCase", () => {
	let repository: InMemoryTodoRepository;
	let useCase: ListTodosUseCase;

	beforeEach(() => {
		repository = new InMemoryTodoRepository();
		useCase = new ListTodosUseCase(repository);
	});

	afterEach(() => {
		repository.clear();
	});

	it("deve retornar uma lista vazia quando não há tarefas", async () => {
		const result = await useCase.execute();

		expect(result.todos).toEqual([]);
		expect(result.todos.length).toBe(0);
	});

	it("deve retornar uma lista de tarefas quando existem tarefas", async () => {
		// Arrange
		const todoData = {
			title: "Tarefa de Teste",
			observations: "Observações de teste",
			tasks: ["Tarefa 1", "Tarefa 2"],
			difficulty: "Fácil" as const,
			startDate: new Date(),
			tags: ["teste"],
			userId: "user-123",
			createdAt: new Date(),
		};

		await repository.create(todoData);

		// Act
		const result = await useCase.execute();

		// Assert
		expect(result.todos.length).toBe(1);
		expect(result.todos[0].title).toBe("Tarefa de Teste");
		expect(result.todos[0].difficulty).toBe("Fácil");
	});
});
