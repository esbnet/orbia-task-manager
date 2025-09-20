import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { UserWidget } from "@/components/navigation/user-widget";
import { getCurrentUserId } from "@/hooks/use-current-user";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "orbia",
	description: "Rotina, foco e progresso em um só lugar",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Verificar se o usuário está autenticado
	const userId = await getCurrentUserId();

	if (!userId) {
		// Redirecionar para a página de login se não estiver autenticado
		redirect("/auth/signin");
	}

	return (
		<>
			<HeaderWrapper />
			<main className="flex-1">
				<UserWidget />

				{children}
			</main>
		</>
	);
}
