import { prisma } from "@/infra/database/prisma/prisma-client";
import type { NextRequest } from "next/server";

// 🚨 VERSÃO TEMPORÁRIA SEM AUTENTICAÇÃO - APENAS PARA DESENVOLVIMENTO
// Esta API retorna todos os hábitos sem verificar usuário logado

export async function GET() {
	console.log('⚠️  HABITS TEMP - GET - INICIANDO (SEM AUTENTICAÇÃO)');
	
	try {
		// Buscar todos os hábitos (ignorando userId)
		const habits = await prisma.habit.findMany({
			orderBy: { createdAt: "desc" },
		});
		
		console.log('⚠️  HABITS TEMP - Hábitos encontrados:', habits.length);
		
		// Converter para o formato esperado pelo frontend
		const formattedHabits = habits.map(habit => ({
			id: habit.id,
			title: habit.title,
			observations: habit.observations,
			difficulty: habit.difficulty,
			status: habit.status,
			priority: habit.priority,
			category: habit.category,
			tags: habit.tags,
			reset: habit.reset,
			order: habit.order,
			lastCompletedDate: habit.lastCompletedDate,
			userId: habit.userId,
			createdAt: habit.createdAt,
			updatedAt: habit.updatedAt,
		}));
		
		return Response.json({ habits: formattedHabits });
		
	} catch (error) {
		console.error('⚠️  HABITS TEMP - ERRO:', error);
		return Response.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	console.log('⚠️  HABITS TEMP - POST - INICIANDO');
	
	try {
		const {
			title,
			observations,
			difficulty,
			priority,
			category,
			tags,
			reset,
			createdAt
		} = await request.json();
		
		// Para desenvolvimento, usar um userId padrão se não há usuário logado
		const defaultUserId = "temp-dev-user";
		
		// Verificar/criar usuário padrão
		await prisma.user.upsert({
			where: { id: defaultUserId },
			update: {},
			create: { 
				id: defaultUserId,
				email: 'temp@dev.local'
			},
		});
		
		const habit = await prisma.habit.create({
			data: {
				title,
				observations: observations || '',
				difficulty,
				status: "Em Andamento",
				priority: priority || "Média",
				category: category || "Pessoa",
				tags: tags || [],
				reset,
				order: 0,
				userId: defaultUserId,
			},
		});
		
		return Response.json({ habit }, { status: 201 });
		
	} catch (error) {
		console.error('⚠️  HABITS TEMP - POST ERRO:', error);
		return Response.json({ error: error.message }, { status: 500 });
	}
}
