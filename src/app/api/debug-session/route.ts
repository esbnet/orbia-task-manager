import { getCurrentUser, getCurrentUserId, getCurrentUserIdWithFallback } from "@/hooks/use-current-user";

export async function GET() {
	try {
		const debugEnabled =
			process.env.NODE_ENV !== "production" || process.env.ENABLE_DEBUG_API === "true";
		if (!debugEnabled) {
			return Response.json({ error: "Not found" }, { status: 404 });
		}

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
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
