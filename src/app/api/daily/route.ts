import { CreateDailyUseCase } from "@/application/use-cases/daily/create-daily/create-daily-use-case";
import { DeleteDailyUseCase } from "@/application/use-cases/daily/delete-daily-use-case/delete-daily-use-case";
import { ListDailyUseCase } from "@/application/use-cases/daily/list-daily/list-daily-use-case";
import { UpdateDailyUseCase } from "@/application/use-cases/daily/update-daily/update-daily-use-case";
import { PrismaDailyRepository } from "@/infra/database/prisma/prisma-daily-repository";
import type { NextRequest } from "next/server";

// Instância única do repositório
// const dailyRepo = new InJsonFileDailyRepository();
const dailyRepo = new PrismaDailyRepository();

export async function GET() {
	const useCase = new ListDailyUseCase(dailyRepo);
	const result = await useCase.execute();
	return Response.json({ daily: result.daily });
}

export async function POST(request: NextRequest) {
	const { title, observations, tasks, difficulty, repeat, tags } =
		await request.json();
	const useCase = new CreateDailyUseCase(dailyRepo);
	const result = await useCase.execute({
		title: title,
		observations: observations || "", // Default value
		tasks: tasks || [], // Default value
		difficulty: difficulty || "Fácil", // Default value
		startDate: new Date(),
		repeat: {
			type: repeat.type || "Diária",
			frequency: 1, // Default value
		},
		tags: tags || [], // Default value
		createdAt: new Date(),
	});
	return Response.json(result, { status: 201 });
}

// export async function PUT(request: NextRequest) {
// 	const { id } = await request.json();
// 	const useCase = new ToggleCompleteUseCase(dailyRepo);
// 	await useCase.execute(id);
// 	return new Response(null, { status: 204 });
// }

export async function PATCH(request: NextRequest) {
	const { daily } = await request.json();
	const useCase = new UpdateDailyUseCase(dailyRepo);
	const updatedDaily = await useCase.execute(daily);
	return Response.json({ daily: updatedDaily }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	const useCase = new DeleteDailyUseCase(dailyRepo);
	await useCase.execute({ id });
	return new Response(null, { status: 204 });
}
