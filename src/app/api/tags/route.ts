import { PrismaTagRepository } from "@/infra/database/prisma/prisma-tag-repository";
import type { NextRequest } from "next/server";

const tagRepo = new PrismaTagRepository();

export async function GET() {
	try {
		const tags = await tagRepo.list();
		return Response.json({ tags });
	} catch (error) {
		console.error("Error in tags API:", error);
		return Response.json({ tags: [] });
	}
}

export async function POST(request: NextRequest) {
	const { name, color } = await request.json();
	const tag = await tagRepo.create({
		name,
		color: color || "#3b82f6",
		userId: ""
	});
	return Response.json({ tag }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
	const { id, name: tagName, color: tagColor, createdAt: tagCreatedAt } =
		await request.json();

	if (!id) {
		return new Response("Tag not provided in the request", { status: 400 });
	}

	const tagData = {
		id,
		userId: "",
		name: tagName || "New Tag",
		color: tagColor || "#3b82f6",
		createdAt: tagCreatedAt || new Date(),
	};

	const updatedTag = await tagRepo.update(tagData);
	return Response.json({ tag: updatedTag });
}

export async function DELETE(request: NextRequest) {
	const { id } = await request.json();
	await tagRepo.delete(id);
	return new Response(null, { status: 204 });
}
