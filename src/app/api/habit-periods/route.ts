import { prisma } from "@/infra/database/prisma/prisma-client";



export async function GET() {
    try {
        const habitPeriods = await prisma.habitPeriod.findMany({
            include: {
                habit: {
                    select: {
                        title: true,
                        difficulty: true,
                        tags: true
                    }
                },
                HabitEntry: {
                    select: {
                        timestamp: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return Response.json({ habitPeriods });
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch habit periods' },
            { status: 500 }
        );
    }
}