import { UseCaseFactory } from "@/infra/di/use-case-factory";

export async function GET() {
	try {
		const getActiveTasksUseCase = UseCaseFactory.createGetActiveTasksUseCase();

		const result = await getActiveTasksUseCase.execute();
		return Response.json(result);
	} catch (error) {
		return Response.json({ tasks: [] }, { status: 500 });
	}
}