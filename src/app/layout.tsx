import "./globals.css";

import { Kode_Mono, Lobster } from "next/font/google";

import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import { ThemeProviderWrapper } from "@/components/providers/theme-provider-wrapper";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const lobster = Lobster({
	subsets: ["latin"],
	weight: "400", // Lobster geralmente só tem peso 400
	variable: "--font-lobster",
});

const kodeMono = Kode_Mono({
	subsets: ["latin"],
	weight: "400", // Lobster geralmente só tem peso 400
	variable: "--font-kode-mono",
});

export const metadata: Metadata = {
	title: "Task Manager",
	description: "Gerenciador de Tarefas",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${lobster.className}  ${kodeMono.className} antialiased flex min-h-screen flex-col`}
			>
				<AuthProvider>
					<QueryClientProviderWrapper>
						<ThemeProviderWrapper>
							<main className="flex-1">{children}</main>
							<Toaster richColors />
						</ThemeProviderWrapper>
					</QueryClientProviderWrapper>
				</AuthProvider>
			</body>
		</html>
	);
}
