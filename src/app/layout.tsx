import "./globals.css";

import { Kode_Mono, Lobster } from "next/font/google";

import { Header } from "@/components/layout/header";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

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
					<Header />
					<main className="flex-1">{children}</main>
					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
