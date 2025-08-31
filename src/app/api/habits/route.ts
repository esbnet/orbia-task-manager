import { CreateHabitUseCase } from "@/application/use-cases/habit/create-habit/create-habit-use-case";
import { DeleteHabitUseCase } from "@/application/use-cases/habit/delete-habit/delete-habit-use-case";
import { ListHabitsUseCase } from "@/application/use-cases/habit/list-habit/list-task-use-case";
import { ToggleCompleteUseCase as ToggleCompleteHabitUseCase } from "@/application/use-cases/habit/toggle-complete-habit/toggle-complete-habit-use-case";
import { UpdateHabitUseCase } from "@/application/use-cases/habit/update-habit/update-habit-use-case";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

// Instância única do repositório
//const habitRepository = new InJsonFileHabitRepository();
const habitRepository = new PrismaHabitRepository();

export async function GET() {
	const useCase = new ListHabitsUseCase(habitRepository);
	const result = await useCase.execute();
	return Response.json({ habits: result.habits });
}

export async function POST(request: NextRequest) {
	const {
		userId,
		title,
		observations,
		difficulty,
		priority,
		category,
		tags,
		reset,
		createdAt
	} = await request.json();

	const useCase = new CreateHabitUseCase(habitRepository);
	const result = await useCase.execute({
		userId,
		title,
		observations,
		difficulty,
		priority,
		category,
		tags,
		reset,
		createdAt,
	});
	return Response.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
	const { id } = await request.json();
	const useCase = new ToggleCompleteHabitUseCase(habitRepository);
	await useCase.execute(id);
	return new Response(null, { status: 204 });
}

export async function PATCH(request: NextRequest) {
	const { habit } = await request.json();
	const useCase = new UpdateHabitUseCase(habitRepository);
	const updatedHabit = await useCase.execute(habit);
	return Response.json({ habit: updatedHabit }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	const useCase = new DeleteHabitUseCase(habitRepository);
	await useCase.execute(id);
	return new Response(null, { status: 204 });
}
