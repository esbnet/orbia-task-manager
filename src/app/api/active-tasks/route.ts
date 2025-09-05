import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import { PrismaTodoRepository } from "@/infra/database/prisma/prisma-todo-repository";

const habitRepository = new PrismaHabitRepository();
const dailyRepository = new PrismaDailyRepository();
const todoRepository = new PrismaTodoRepository();

export async function GET() {
	try {
		console.log("🔍 Buscando todas as tarefas ativas...");

		// Buscar todas as tarefas sem filtrar por usuário (para popular o multiselect)
		const [habits, dailies, todos] = await Promise.all([
			habitRepository.list().catch(() => []),
			dailyRepository.list().catch(() => []),
			todoRepository.list().catch(() => []),
		]);

		console.log("📊 Dados encontrados:", {
			habits: habits.length,
			dailies: dailies.length,
			todos: todos.length,
		});

		const activeTasks: Array<{
			id: string;
			title: string;
			type: "habit" | "daily" | "todo";
			difficulty: string;
			icon: string;
		}> = [];

		// Adicionar hábitos ativos
		habits.forEach((habit) => {
			if (habit.status === "Em Andamento") {
				activeTasks.push({
					id: habit.id,
					title: habit.title,
					type: "habit",
					difficulty: habit.difficulty,
					icon: "🔄",
				});
			}
		});

		// Adicionar dailies
		dailies.forEach((daily) => {
			activeTasks.push({
				id: daily.id,
				title: daily.title,
				type: "daily",
				difficulty: daily.difficulty,
				icon: "📅",
			});
		});

		// Adicionar todos
		todos.forEach((todo) => {
			activeTasks.push({
				id: todo.id,
				title: todo.title,
				type: "todo",
				difficulty: todo.difficulty,
				icon: "✅",
			});
		});

		console.log("✅ Total de tarefas ativas encontradas:", activeTasks.length);

		return Response.json({ tasks: activeTasks });
	} catch (error) {
		console.error("❌ Erro ao buscar tarefas ativas:", error);
		return Response.json({ tasks: [] }, { status: 500 });
	}
}