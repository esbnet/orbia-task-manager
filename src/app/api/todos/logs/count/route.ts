import { PrismaTodoLogRepository } from "@/infra/database/prisma/prisma-todo-log-repository";

const todoLogRepo = new PrismaTodoLogRepository();

/**
 * @swagger
 * /api/todos/logs/count:
 *   get:
 *     tags: [Tasks]
 *     summary: Busca todos os logs de conclusão de todos
 *     description: |
 *       Retorna apenas os logs de todos que foram completados.
 *       Usa exclusivamente a tabela todo_logs.
 *     responses:
 *       200:
 *         description: Lista de logs de todos completados
 */
export async function GET() {
	try {
		// Buscar todos os logs de todos (APENAS completados)
		const logs = await todoLogRepo.list();

		// Retornar apenas os logs como todos "completados"
		const completedTodos = logs.map(log => ({
			id: log.todoId,
			title: log.todoTitle,
			difficulty: log.difficulty,
			tags: log.tags,
			completedAt: log.completedAt,
			// Campos necessários para manter compatibilidade
			observations: "",
			tasks: [],
			startDate: log.completedAt,
			order: 0,
			lastCompletedDate: log.completedAt.toISOString().split("T")[0],
			createdAt: log.completedAt,
			userId: "", // Não temos userId no log, mas não é usado na contagem
		}));

		console.log(`[TODO-LOGS-COUNT] 📊 Found ${logs.length} completed todos from logs`);

		return Response.json({
			todos: completedTodos,
			metadata: {
				totalCompleted: logs.length,
				source: "logs_only"
			}
		});
	} catch (error) {
		console.error("Erro ao buscar logs de todos:", error);
		// Retorna dados vazios em caso de erro para não quebrar o frontend
		return Response.json({
			todos: [],
			metadata: {
				totalCompleted: 0,
				source: "logs_only"
			}
		});
	}
}