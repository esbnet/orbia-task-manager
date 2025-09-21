import HomePage from "@/components/home/home-page";
import SignInForm from "@/components/auth/signin-form";
import { auth } from "@/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login - Orbia",
	description: "Faça login para acessar suas tarefas e hábitos"
};

export default async function SignIn() {
  const session = await auth();
  if (!session) return <SignInForm />;
  return <HomePage />;

}