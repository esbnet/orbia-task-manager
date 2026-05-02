import { HabitModule } from "@/modules/habit";
import type { NextRequest } from "next/server";

export async function PATCH(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await HabitModule.archive(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json({ error: "Failed to archive habit" }, { status: 500 });
	}
}
