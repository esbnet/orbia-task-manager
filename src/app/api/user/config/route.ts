import { GetUserConfigUseCase } from "@/application/use-cases/user-config/get-user-config/get-user-config-use-case";
import { UpdateUserConfigUseCase } from "@/application/use-cases/user-config/update-user-config/update-user-config-use-case";
import { auth } from "@/auth";
import { LOCALE_COOKIE } from "@/i18n/shared";
import { PrismaUserConfigRepository } from "@/infra/database/prisma/prisma-user-config-repository";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const userConfigRepository = new PrismaUserConfigRepository();
const getUserConfigUseCase = new GetUserConfigUseCase(userConfigRepository);
const updateUserConfigUseCase = new UpdateUserConfigUseCase(userConfigRepository);

/**
 * @swagger
 * /api/user/config:
 *   get:
 *     tags: [User Config]
 *     summary: Obtém as configurações do usuário
 *     responses:
 *       200:
 *         description: Configurações do usuário
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
export async function GET() {
	try {
		// Autenticação
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 401 },
			);
		}

		// Executar use case
		const result = await getUserConfigUseCase.execute({
			userId: session.user.id,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("Erro ao obter configurações do usuário:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}

/**
 * @swagger
 * /api/user/config:
 *   put:
 *     tags: [User Config]
 *     summary: Atualiza as configurações do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               language:
 *                 type: string
 *                 enum: ["pt-BR", "en-US", "es-ES"]
 *               notifications:
 *                 type: boolean
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configurações atualizadas
 *       401:
 *         description: Não autorizado
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */
export async function PUT(request: NextRequest) {
	try {
		// Autenticação
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 401 },
			);
		}

		// Parsing do body
		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: "JSON inválido" },
				{ status: 400 },
			);
		}

		const { theme, language, notifications, timezone } = body;

		/**
		 * Validação de entrada - idiomas suportados limitados a pt-BR, en-US e es-ES
		 * para manter consistência com o sistema de i18n implementado
		 */
		const validThemes = ["light", "dark", "system"];
		const validLanguages = ["pt-BR", "en-US", "es-ES"];

		if (theme && !validThemes.includes(theme)) {
			return NextResponse.json(
				{ error: "Tema inválido" },
				{ status: 400 },
			);
		}

		if (language && !validLanguages.includes(language)) {
			return NextResponse.json(
				{ error: "Idioma inválido" },
				{ status: 400 },
			);
		}

		// Executar use case
		const result = await updateUserConfigUseCase.execute({
			userId: session.user.id,
			theme,
			language,
			notifications,
			timezone,
		});

		const res = NextResponse.json(result);
		// Se o idioma foi enviado e é válido, persistir no cookie de locale
		if (language && validLanguages.includes(language)) {
			res.cookies.set(LOCALE_COOKIE, language, { path: "/", sameSite: "lax" });
		}
		return res;
	} catch (error) {
		console.error("Erro ao atualizar configurações do usuário:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 },
		);
	}
}