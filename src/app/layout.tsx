import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Kode_Mono, Lobster } from "next/font/google";

import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import { ThemeProviderWrapper } from "@/components/providers/theme-provider-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { UserWidget } from "@/components/navigation/user-widget";
import { getRequestLocale } from "@/i18n/index";
import { getDictionary } from "@/i18n/shared";
import { PWARegister } from "./pwa-register";

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
	title: "Orbia",
	description: "Rotina, foco e progresso em um só lugar",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Orbia",
	},
};

export const viewport: Viewport = {
	themeColor: "#000000",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	try {
		const locale = await getRequestLocale();
		const dict = getDictionary(locale);

		return (
			<html lang={locale} suppressHydrationWarning>
				<body
					className={`${lobster.className}  ${kodeMono.className} antialiased flex min-h-screen flex-col`}
				>
					<I18nProvider locale={locale} dict={dict}>
						<AuthProvider>
							<QueryClientProviderWrapper>
								<ThemeProviderWrapper>
									<UserWidget />
									<main className="flex-1">{children}</main>
									<Toaster richColors />
									<PWARegister />
								</ThemeProviderWrapper>
							</QueryClientProviderWrapper>
						</AuthProvider>
					</I18nProvider>
				</body>
			</html>
		);
	} catch (error) {
		const dict = getDictionary("pt-BR");
		return (
			<html lang="pt-BR" suppressHydrationWarning>
				<body
					className={`${lobster.className}  ${kodeMono.className} antialiased flex min-h-screen flex-col`}
				>
					<I18nProvider locale="pt-BR" dict={dict}>
						<AuthProvider>
							<QueryClientProviderWrapper>
								<ThemeProviderWrapper>
									<UserWidget />
									<main className="flex-1">{children}</main>
									<Toaster richColors />
									<PWARegister />
								</ThemeProviderWrapper>
							</QueryClientProviderWrapper>
						</AuthProvider>
					</I18nProvider>
				</body>
			</html>
		);
	}
}
