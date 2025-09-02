import { getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const mode = searchParams.get('mode') || 'normal';

	try {
		const currentUserId = await getCurrentUserId();
		
		let habits;
		
		switch (mode) {
			case 'all':
				// Retorna todos os hábitos independente do usuário
				habits = await prisma.habit.findMany({
					orderBy: { createdAt: "desc" },
				});
				break;
				
			case 'migrate':
				// Migra hábitos órfãos para o usuário atual se estiver logado
				if (!currentUserId) {
					return Response.json({ error: "Usuário deve estar autenticado para migrar" }, { status: 401 });
				}
				
				const orphanHabits = await prisma.habit.findMany({
					where: {
						NOT: { userId: currentUserId }
					}
				});
				
				if (orphanHabits.length > 0) {
					await prisma.habit.updateMany({
						where: {
							NOT: { userId: currentUserId }
						},
						data: {
							userId: currentUserId
						}
					});
				}
				
				// Após migração, retorna hábitos do usuário atual
				habits = await prisma.habit.findMany({
					where: { userId: currentUserId },
					orderBy: { order: "asc" },
				});
				break;
				
			case 'normal':
			default:
				// Comportamento normal - só hábitos do usuário logado
				if (!currentUserId) {
					return Response.json({ 
						error: "Usuário não autenticado", 
						suggestion: "Use ?mode=all para ver todos os hábitos ou faça login"
					}, { status: 401 });
				}
				
				habits = await prisma.habit.findMany({
					where: { userId: currentUserId },
					orderBy: { order: "asc" },
				});
				break;
		}
		
		return Response.json({
			habits: habits.map(habit => ({
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
			})),
			metadata: {
				count: habits.length,
				mode,
				currentUserId,
				timestamp: new Date().toISOString()
			}
		});
		
	} catch (error) {
		return Response.json({ error: error }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { action, targetUserId } = body;
	
	try {
		// const currentUserId = await getCurrentUserId();
		
		switch (action) {
			case 'assign-to-user':
				if (!targetUserId) {
					return Response.json({ error: "targetUserId é obrigatório para assign-to-user" }, { status: 400 });
				}
				
				// Verificar se o usuário alvo existe
				const targetUser = await prisma.user.findUnique({
					where: { id: targetUserId }
				});
				
				if (!targetUser) {
					return Response.json({ error: "Usuário alvo não encontrado" }, { status: 404 });
				}
				
				// Migrar todos os hábitos órfãos para o usuário alvo
				const migrateResult = await prisma.habit.updateMany({
					where: {
						userId: { not: targetUserId }
					},
					data: {
						userId: targetUserId
					}
				});
				
				return Response.json({
					message: `${migrateResult.count} hábitos migrados para o usuário ${targetUserId}`,
					migrated: migrateResult.count
				});
				
			case 'create-demo-user':
				// Criar um usuário demo e migrar hábitos para ele
				const demoUser = await prisma.user.create({
					data: {
						id: `demo-user-${Date.now()}`,
						email: 'demo@taskmanager.dev'
					}
				});
				
				const demoMigrateResult = await prisma.habit.updateMany({
					data: {
						userId: demoUser.id
					}
				});
				
				return Response.json({
					message: `Usuário demo criado e ${demoMigrateResult.count} hábitos migrados`,
					demoUserId: demoUser.id,
					migrated: demoMigrateResult.count
				});
				
			default:
				return Response.json({ error: "Ação inválida" }, { status: 400 });
		}
		
	} catch (error) {
		return Response.json({ error: error }, { status: 500 });
	}
}
