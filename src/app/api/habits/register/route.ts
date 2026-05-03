import { HabitModule } from "@/modules/habit";
import type { NextRequest } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
	habitId: z.string().min(1),
	note: z.string().optional(),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = registerSchema.parse(body);

		const result = await HabitModule.registerWithLog(validated);
		return Response.json(result, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		if (error instanceof Error) {
			return Response.json({ error: error.message }, { status: 400 });
		}
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
