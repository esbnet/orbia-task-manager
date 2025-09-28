import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        console.error('Error fetching habit periods:', error);
        return Response.json(
            { error: 'Failed to fetch habit periods' },
            { status: 500 }
        );
    }
}