import { UpdateHabitUseCase } from "@/application/use-cases/habit/update-habit/update-habit-use-case";
import { PrismaHabitRepository } from "@/infra/database/prisma/prisma-habit-repository";
import type { NextRequest } from "next/server";

const habitRepository = new PrismaHabitRepository();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const habit = await habitRepository.findById(id);

		if (!habit) {
			return Response.json({ error: "Habit not found" }, { status: 404 });
		}

		return Response.json({ habit });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { habit: updateData } = await request.json();

		// Buscar o hábito existente
		const existingHabit = await habitRepository.findById(id);
		if (!existingHabit) {
			return Response.json({ error: "Habit not found" }, { status: 404 });
		}

		// Mesclar os dados existentes com as atualizações
		const updatedHabitData = {
			...existingHabit,
			...updateData,
			id,
			updatedAt: new Date(),
		};

		const useCase = new UpdateHabitUseCase(habitRepository);
		const result = await useCase.execute(updatedHabitData);

		return Response.json({ habit: result });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await habitRepository.delete(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
