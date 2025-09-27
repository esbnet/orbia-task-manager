import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { UserWidget } from "@/components/navigation/user-widget";
import { getCurrentUserId } from "@/hooks/use-current-user";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: {
		template: '%s | Orbia',
		default: 'Orbia', // a default is required when creating a template
	},
	description: "Rotina, foco e progresso em um só lugar",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Orbia",
	},
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
		<div className="m-auto">
			<HeaderWrapper />
			<div className="flex-1">
				<UserWidget />
				{children}
			</div>
		</div>
	);
}
