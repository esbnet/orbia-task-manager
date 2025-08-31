import { getCurrentUser, getCurrentUserId, getCurrentUserIdWithFallback } from "@/hooks/use-current-user";

export async function GET() {
	console.log('🔍 DEBUG SESSION - INICIANDO');
	
	try {
		const user = await getCurrentUser();
		const userId = await getCurrentUserId();
		const userIdWithFallback = await getCurrentUserIdWithFallback();
		
		console.log('🔍 DEBUG SESSION - user:', user);
		console.log('🔍 DEBUG SESSION - userId:', userId);
		console.log('🔍 DEBUG SESSION - userIdWithFallback:', userIdWithFallback);
		
		return Response.json({
			user,
			userId,
			userIdWithFallback,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('🔍 DEBUG SESSION - ERRO:', error);
		return Response.json({ error: error }, { status: 500 });
	}
}
