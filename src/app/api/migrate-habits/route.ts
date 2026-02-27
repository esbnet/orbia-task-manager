import { getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";

export async function POST() {
	try {
		const migrationEnabled =
			process.env.NODE_ENV !== "production" || process.env.ENABLE_MIGRATION_API === "true";
		if (!migrationEnabled) {
			return Response.json({ error: "Not found" }, { status: 404 });
		}

		const currentUserId = await getCurrentUserId();
		if (!currentUserId) {
			return Response.json({ error: "Usuário não autenticado" }, { status: 401 });
		}
		
		// Buscar hábitos órfãos (de usuários que não são o atual)
		const orphanHabits = await prisma.habit.findMany({
			where: {
				NOT: {
					userId: currentUserId
				}
			}
		});
		
		
		if (orphanHabits.length === 0) {
			return Response.json({ 
				message: "Nenhum hábito órfão encontrado", 
				migrated: 0 
			});
		}
		
		// Migrar hábitos para o usuário atual
		const migrationResult = await prisma.habit.updateMany({
			where: {
				NOT: {
					userId: currentUserId
				}
			},
			data: {
				userId: currentUserId
			}
		});
		
		
		return Response.json({
			message: `${migrationResult.count} hábitos migrados com sucesso para o usuário ${currentUserId}`,
			migrated: migrationResult.count
		});
		
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
