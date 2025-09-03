import { auth } from "@/auth";
import SignInForm from "@/components/auth/signin-form";
import HomePage from "@/components/home/home-page";

export default async function Home() {
	const session = await auth();
	if (!session) return <SignInForm />;
	return <HomePage />;
}
