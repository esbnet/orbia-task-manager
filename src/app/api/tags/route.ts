import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const tags = await prisma.tag.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' }
        });

        return Response.json({ tags });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return Response.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { name, color } = await request.json();

        const tag = await prisma.tag.create({
            data: {
                name,
                color: color || "#3b82f6",
                userId: session.user.id
            }
        });

        return Response.json({ tag }, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return Response.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}