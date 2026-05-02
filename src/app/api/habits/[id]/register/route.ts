import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { idSchema } from "@/infra/validation/schemas";
import { HabitModule } from "@/modules/habit";
import type { NextRequest } from "next/server";
import { z } from "zod";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();

		const validatedId = idSchema.parse(id);
		const sanitizedId = InputSanitizer.sanitizeId(validatedId);

		const bodySchema = z.object({
			note: z.string().optional(),
		});
		const validatedBody = bodySchema.parse(body);

		const result = await HabitModule.register({
			habitId: sanitizedId,
			note: validatedBody.note ? String(validatedBody.note) : undefined,
		});

		return Response.json(result, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: error.issues }, { status: 400 });
		}
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
