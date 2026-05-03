import { HabitModule } from "@/modules/habit";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
	try {
		const { ids } = await request.json();

		if (!Array.isArray(ids)) {
			return Response.json(
				{ error: "IDs must be an array" },
				{ status: 400 }
			);
		}

		await HabitModule.reorder(ids);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
