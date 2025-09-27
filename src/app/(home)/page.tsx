import { auth } from "@/auth";
import SignInForm from "@/components/auth/signin-form";
import HomePage from "@/components/home/home-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Rotina, foco e progresso em um só lugar"
};

export default async function Home() {
	const session = await auth();
	return (!session ? <SignInForm /> : <HomePage />)
}
