import { GetUserConfigUseCase } from "@/application/use-cases/user-config/get-user-config/get-user-config-use-case";
import { auth } from "@/auth";
import SignInForm from "@/components/auth/signin-form";
import HomeOpenclawAlternative from "@/components/home/home-openclaw-alternative";
import HomePage from "@/components/home/home-page";
import { PrismaUserConfigRepository } from "@/infra/database/prisma/prisma-user-config-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Rotina, foco e progresso em um só lugar"
};

export const dynamic = 'force-dynamic';

const userConfigRepository = new PrismaUserConfigRepository();
const getUserConfigUseCase = new GetUserConfigUseCase(userConfigRepository);

type HomeProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeParam(value: string | string[] | undefined): string {
	if (Array.isArray(value)) {
		return value[0]?.toLowerCase() ?? "";
	}

	return value?.toLowerCase() ?? "";
}

export default async function Home({ searchParams }: HomeProps) {
	const session = await auth();

	if (!session) {
		return <SignInForm />;
	}

	const params = (await searchParams) ?? {};
	const layoutParam = normalizeParam(params.layout);
	const variantParam = normalizeParam(params.variant);
	const layoutFromEnv = process.env.HOME_LAYOUT_VARIANT?.toLowerCase() ?? "";
	const persistedLayout = (await getUserConfigUseCase.execute({ userId: session.user.id })).config?.homeLayout;
	const wantsAlternative =
		layoutParam === "openclaw" ||
		layoutParam === "alt" ||
		variantParam === "openclaw" ||
		layoutFromEnv === "openclaw" ||
		persistedLayout === "openclaw";

	return wantsAlternative ? <HomeOpenclawAlternative /> : <HomePage />;
}
