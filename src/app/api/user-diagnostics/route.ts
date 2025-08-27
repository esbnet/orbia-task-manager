import { getCurrentUser, getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";

export async function GET() {
	console.log('🔍 USER DIAGNOSTICS - INICIANDO');
	
	try {
		const user = await getCurrentUser();
		const userId = await getCurrentUserId();
		
		console.log('🔍 USER DIAGNOSTICS - user:', user);
		console.log('🔍 USER DIAGNOSTICS - userId:', userId);
		
		// Contar dados por usuário
		const allUsers = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				_count: {
					select: {
						habits: true,
						dailies: true,
						todos: true,
						goals: true,
					}
				}
			}
		});
		
		return Response.json({
			currentUser: user,
			currentUserId: userId,
			allUsers,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('🔍 USER DIAGNOSTICS - ERRO:', error);
		return Response.json({ error: error.message }, { status: 500 });
	}
}
