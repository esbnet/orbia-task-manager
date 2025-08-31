import { getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";

export async function POST() {
	console.log('🔄 MIGRATE HABITS - INICIANDO');
	
	try {
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
		
		console.log('🔄 MIGRATE HABITS - Hábitos órfãos encontrados:', orphanHabits.length);
		
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
		
		console.log('🔄 MIGRATE HABITS - Hábitos migrados:', migrationResult.count);
		
		return Response.json({
			message: `${migrationResult.count} hábitos migrados com sucesso para o usuário ${currentUserId}`,
			migrated: migrationResult.count
		});
		
	} catch (error) {
		console.error('🔄 MIGRATE HABITS - ERRO:', error);
		return Response.json({ error: error }, { status: 500 });
	}
}
