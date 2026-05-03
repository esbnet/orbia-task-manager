import { auth } from "@/auth";
import { TagModule } from "@/modules/tag";
import { z } from "zod";

const createTagSchema = z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#3b82f6"),
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const tags = await TagModule.list(session.user.id);
        return Response.json({ tags });
    } catch (error) {
        return Response.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { name, color } = createTagSchema.parse(body);

        const tag = await TagModule.create({ name, color, userId: session.user.id });
        return Response.json({ tag }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: error.issues }, { status: 400 });
        }
        return Response.json({ error: "Failed to create tag" }, { status: 500 });
    }
}
