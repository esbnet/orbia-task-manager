import "./globals.css";

import { Kode_Mono, Lobster } from "next/font/google";

import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

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
				<QueryClientProviderWrapper>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
						value={{
							light: "light",
							dark: "dark",
						}}
					>
						<main className="flex-1">{children}</main>
						<Toaster richColors />
					</ThemeProvider>
				</QueryClientProviderWrapper>
			</body>
		</html>
	);
}
