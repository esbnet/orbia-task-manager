import { ListTodosUseCase } from "@/application/use-cases/todo/list-todo/list-todo-use-case";
import { ApiTodoRepository } from "@/infra/repositories/http/api-todo-repository";

describe("Use Case: ListTodosUseCase", () => {
	it("deve retornar uma lista de tarefas", async () => {
		const repo = new ApiTodoRepository();
		const useCase = new ListTodosUseCase(repo);

		const result = await useCase.execute();

		expect(result.todos[0].title).toBe("Tarefa 1");
		expect(result.todos.length).toBeGreaterThan(0);
	});
});
