import type { CreateTodoInput } from "@/application/use-cases/todo/create-todo/create-todo-dto";
import { CreateTodoUseCase } from "@/application/use-cases/todo/create-todo/create-todo-use-case";
import { ApiTodoRepository } from "@/infra/repositories/http/api-todo-repository";

describe("should be able to create a todo", () => {
	let useCase: CreateTodoUseCase;
	let todoRepository: ApiTodoRepository;

	beforeEach(() => {
		todoRepository = new ApiTodoRepository();
		useCase = new CreateTodoUseCase(todoRepository);
	});

	it("deve criar uma tarefa", async () => {
		const inputTodo: CreateTodoInput = {
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
