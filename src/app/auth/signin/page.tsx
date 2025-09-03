import HomePage from "@/components/home/home-page";
import SignInForm from "@/components/auth/signin-form";
import { auth } from "@/auth";

export default async function SignIn() {
  const session = await auth();
  if (!session) return <SignInForm />;
  return <HomePage />;

}