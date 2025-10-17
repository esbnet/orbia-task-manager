import type { TodoLogRepository, TodoRepository } from "@/domain/repositories/all-repository";
import type { CompletePontualInput, CompletePontualOutput } from "./complete-pontual-dto";


export class CompletePontualUseCase {
	constructor(
		private readonly todoRepository: TodoRepository,
		private readonly todoLogRepository: TodoLogRepository
	) {}

	async execute(input: CompletePontualInput): Promise<CompletePontualOutput> {
		// Buscar o todo atual para obter os dados necessários
		const currentTodo = await this.todoRepository.findById(input.id);
		if (!currentTodo) {
			throw new Error("Todo not found");
		}

		// Verificar se é uma tarefa pontual
		if (!currentTodo.todoType.isPontual()) {
			throw new Error("Esta operação é válida apenas para tarefas pontuais");
		}

		// Verificar se já está completa
		if (currentTodo.lastCompletedDate) {
			throw new Error("Tarefa já está concluída");
		}

		// Criar log antes de completar
		const log = await this.todoLogRepository.create({
			todoId: currentTodo.id,
			todoTitle: currentTodo.title,
			difficulty: currentTodo.difficulty,
			tags: currentTodo.tags,
			completedAt: new Date(),
		});

		// Marcar como completa (definir data de conclusão)
		const completedTodo = await this.todoRepository.update({
			...currentTodo,
			lastCompletedDate: new Date().toISOString().split("T")[0],
		});

		return {
			todo: {
				id: completedTodo.id,
				title: completedTodo.title,
				observations: completedTodo.observations,
				tasks: completedTodo.tasks,
				difficulty: completedTodo.difficulty,
				startDate: completedTodo.startDate,
				tags: completedTodo.tags,
				createdAt: completedTodo.createdAt,
				order: completedTodo.order,
				userId: completedTodo.userId,
				lastCompletedDate: completedTodo.lastCompletedDate,
				recurrence: completedTodo.recurrence,
				recurrenceInterval: completedTodo.recurrenceInterval,
				todoType: completedTodo.todoType.getValue(),
				subtasks: completedTodo.subtasks,
			},
			log: {
				id: log.id,
				todoId: log.todoId,
				todoTitle: log.todoTitle,
				difficulty: log.difficulty,
				tags: log.tags,
				completedAt: log.completedAt,
			},
		};
	}
}