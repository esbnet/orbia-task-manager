import { getCurrentUser, getCurrentUserId, getCurrentUserIdWithFallback } from "@/hooks/use-current-user";

export async function GET() {
	
	try {
		const user = await getCurrentUser();
		const userId = await getCurrentUserId();
		const userIdWithFallback = await getCurrentUserIdWithFallback();
		
		
		return Response.json({
			user,
			userId,
			userIdWithFallback,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return Response.json({ error: error }, { status: 500 });
	}
}
