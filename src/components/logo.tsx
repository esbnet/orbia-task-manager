import { Orbit } from 'lucide-react'
import Link from 'next/link'

export default function Logo() {
    return (
        <div className='flex flex-col justify-center items-center md:items-start w-full'>
            <div className="items-center gap-4 bg-slate-950 dark:bg-slate-300 px-4 py-2 rounded-full w-fit text-slate-300 dark:text-slate-950 md:text-center"
                title="Orbia – Rotina, foco e progresso em um só lugar"
            >
                <Link href="/" className="flex items-center gap-2">
                    <Orbit className="w-6 h-6" />
                    <span className="font-bold">Orbia</span>
                </Link>
            </div>
        </div>

    )
}
