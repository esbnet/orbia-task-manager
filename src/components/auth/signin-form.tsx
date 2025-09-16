import Image from 'next/image'
import Logo from '../logo'
import { Button } from '../ui/button'

const googleIcon = '../../google.svg'

export default function SignInForm() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col justify-center items-center space-y-8 bg-muted shadow-xl p-8 py-16 rounded-lg w-full max-w-sm md:max-w-lg">
                <div className='flex w-full text-center'>
                    <Logo />
                </div>

                <p className="font-bold text-2xl text-center">
                    Rotina, foco e progresso em um só lugar
                </p>

                <div className="space-y-4">
                    <form
                        action={async () => {
                            "use server"
                            const { signIn } = await import("@/auth")
                            await signIn("google", { redirectTo: "/" })
                        }}
                    >
                        <Button variant={"default"} type="submit" className="p-6 rounded w-full">
                            <Image src={googleIcon}
                                alt="Google" className="mr-2 w-6 h-6"
                                width={24}
                                height={24}
                                loading="lazy"
                            />
                            Entrar com Google
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
