import { getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";

export async function POST() {
	
	try {
		const currentUserId = await getCurrentUserId();
		if (!currentUserId) {
			return Response.json({ error: "Usuário não autenticado" }, { status: 401 });
		}
		
		
		// Migrar todas as entidades de outros usuários para o usuário atual
		const results = {
			habits: 0,
			dailies: 0,
			todos: 0,
			goals: 0,
		};
		
		// Migrar hábitos
		const habitsResult = await prisma.habit.updateMany({
			where: {
				userId: { not: currentUserId }
			},
			data: {
				userId: currentUserId
			}
		});
		results.habits = habitsResult.count;
		
		// Migrar dailies
		const dailiesResult = await prisma.daily.updateMany({
			where: {
				userId: { not: currentUserId }
			},
			data: {
				userId: currentUserId
			}
		});
		results.dailies = dailiesResult.count;
		
		// Migrar todos
		const todosResult = await prisma.todo.updateMany({
			where: {
				userId: { not: currentUserId }
			},
			data: {
				userId: currentUserId
			}
		});
		results.todos = todosResult.count;
		
		// Migrar goals
		const goalsResult = await prisma.goal.updateMany({
			where: {
				userId: { not: currentUserId }
			},
			data: {
				userId: currentUserId
			}
		});
		results.goals = goalsResult.count;
		
		return Response.json({
			message: "Migração concluída com sucesso",
			currentUserId,
			migrated: results,
			total: results.habits + results.dailies + results.todos + results.goals
		});
		
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);	}
}
