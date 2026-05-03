import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import { HabitModule } from "@/modules/habit";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const timeRange = url.searchParams.get("timeRange") || "month";

		const sanitizedTimeRange = InputSanitizer.sanitizeForLog(timeRange);
		const validatedTimeRange = InputSanitizer.sanitizeTimeRange(sanitizedTimeRange);

		const result = await HabitModule.analytics(validatedTimeRange);

		return Response.json(result);
	} catch (error) {
		return Response.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}