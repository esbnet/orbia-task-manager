import type { NextRequest } from "next/server";
import { PrismaTagRepository } from "@/infra/database/prisma/prisma-tag-repository";

const tagRepo = new PrismaTagRepository();

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Lista todas as tags
 *     responses:
 *       200:
 *         description: Lista de tags
 */
export async function GET() {
	try {
		const tags = await tagRepo.list();
		return Response.json({ tags });
	} catch (error) {
		return Response.json({ tags: [] });
	}
}

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Cria uma nova tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag criada
 */
export async function POST(request: NextRequest) {
	const { name, color } = await request.json();
	const tag = await tagRepo.create({
		name,
		color: color || "#3b82f6"
	});
	return Response.json({ tag }, { status: 201 });
}

/**
 * @swagger
 * /api/tags:
 *   patch:
 *     summary: Atualiza uma tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Tag atualizada
 *       400:
 *         description: Tag não fornecida
 */
export async function PATCH(request: NextRequest) {
	const { id, name: tagName, color: tagColor, createdAt: tagCreatedAt } =
		await request.json();

	if (!id) {
		return new Response("Tag not provided in the request", { status: 400 });
	}

	// Buscar a tag existente para obter o userId
	const existingTag = await tagRepo.findById(id);
	if (!existingTag) {
		return new Response("Tag not found", { status: 404 });
	}

	const tagData = {
		...existingTag,
		name: tagName || existingTag.name,
		color: tagColor || existingTag.color,
		createdAt: tagCreatedAt || existingTag.createdAt,
	};

	const updatedTag = await tagRepo.update(tagData);
	return Response.json({ tag: updatedTag });
}

/**
 * @swagger
 * /api/tags:
 *   delete:
 *     summary: Deleta uma tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       204:
 *         description: Tag deletada
 */
export async function DELETE(request: NextRequest) {
	const url = new URL(request.url);
	const id = url.searchParams.get('id');
	if (!id) {
		return new Response("ID is required", { status: 400 });
	}
	await tagRepo.delete(id);
	return new Response(null, { status: 204 });
}
