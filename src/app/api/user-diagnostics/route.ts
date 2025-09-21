import { getCurrentUser, getCurrentUserId } from "@/hooks/use-current-user";

import { prisma } from "@/infra/database/prisma/prisma-client";

export async function GET() {
	
	try {
		const user = await getCurrentUser();
		const userId = await getCurrentUserId();
		
		
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
		return Response.json({ error: error }, { status: 500 });
	}
}
