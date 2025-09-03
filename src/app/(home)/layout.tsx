import { Header } from "@/components/layout/header";
import { Metadata } from "next";
import { getCurrentUserId } from "@/hooks/use-current-user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Task Manager",
	description: "Gerenciador de Tarefas",
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
		<main className="flex-1">
			<Header />
			{children}
		</main>
	);
}
