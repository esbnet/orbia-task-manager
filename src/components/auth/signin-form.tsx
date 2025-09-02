import { CheckSquare2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '../ui/button'

const googleIcon = '../../google.svg'

export default function SignInForm() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col justify-center items-center space-y-8 bg-amber-100 shadow-xl p-8 py-16 rounded-lg w-full max-w-sm md:max-w-lg">
                <div className="bg-slate-950 px-4 py-2 rounded-full w-fit text-slate-300">
                    <div className="flex items-center gap-2">
                        <CheckSquare2 className="w-6 h-6" />
                        <h2 className="font-bold">Task Manager</h2>
                    </div>
                </div>
                <div className="items-center text-center">
                    <p className="mt-2 text-gray-600">
                        Faça login para acessar suas tarefas
                    </p>
                </div>

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
