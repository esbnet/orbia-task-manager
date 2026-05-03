import { InMemoryTodoRepository } from "@/infra/repositories/memory/in-memory-todo-repository";
import { listTodos } from "@/modules/todo/use-cases";

describe("Use Case: listTodos", () => {
	let repository: InMemoryTodoRepository;

	beforeEach(() => {
		repository = new InMemoryTodoRepository();
	});

	afterEach(() => {
		repository.clear();
	});

	it("deve retornar uma lista vazia quando não há tarefas", async () => {
		const result = await listTodos(repository);

		expect(result).toEqual([]);
		expect(result.length).toBe(0);
	});

	it("deve retornar uma lista de tarefas quando existem tarefas", async () => {
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

		const result = await listTodos(repository);

		expect(result.length).toBe(1);
		expect(result[0].title).toBe("Tarefa de Teste");
		expect(result[0].difficulty).toBe("Fácil");
	});
});
