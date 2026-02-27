import { UseCaseFactory } from "@/infra/di/use-case-factory";
import { getCurrentUserIdWithFallback } from "@/hooks/use-current-user";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import type { NextRequest } from "next/server";

export async function PATCH(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const sanitizedId = InputSanitizer.sanitizeId(id);
		const result = await UseCaseFactory.createToggleCompleteHabitUseCase().execute(sanitizedId);
		return Response.json(result);
	} catch (error) {
		if (error instanceof Error && error.message.includes("Invalid ID")) {
			return Response.json({ error: error.message }, { status: 400 });
		}
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const userId = await getCurrentUserIdWithFallback();
		if (!userId) {
			return Response.json({ error: "Não autorizado" }, { status: 401 });
		}

		const sanitizedId = InputSanitizer.sanitizeId(id);
		const result = await UseCaseFactory.createMarkIncompleteHabitUseCase().execute(sanitizedId);
		return Response.json(result);
	} catch (error) {
		if (error instanceof Error && error.message.includes("Invalid ID")) {
			return Response.json({ error: error.message }, { status: 400 });
		}
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
