'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log do erro para análise
        console.error('Erro na aplicação:', error)
    }, [error])

    const isDatabaseError = error.message.toLowerCase().includes('database') ||
        error.message.toLowerCase().includes('prisma') ||
        error.message.toLowerCase().includes('connection')

    const isApiError = error.message.toLowerCase().includes('api') ||
        error.message.toLowerCase().includes('fetch') ||
        error.message.toLowerCase().includes('network')

    return (
        <div className="flex justify-center items-center bg-gray-50 min-h-screen">
            <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md text-center">
                <div className="mb-4">
                    <div className="flex justify-center items-center bg-red-100 mx-auto rounded-full w-16 h-16">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="mb-2 font-bold text-gray-900 text-2xl">
                    Ops! Algo deu errado
                </h1>

                <p className="mb-6 text-gray-600">
                    {isDatabaseError
                        ? 'Estamos com problemas de conexão com o banco de dados. Por favor, tente novamente em alguns minutos.'
                        : isApiError
                            ? 'Estamos com problemas de conexão com nossos serviços. Por favor, tente novamente em alguns minutos.'
                            : 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full font-medium text-white transition-colors"
                    >
                        Tentar novamente
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md w-full font-medium text-gray-800 transition-colors"
                    >
                        Voltar ao início
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-6 text-left">
                        <summary className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer">
                            Detalhes do erro (desenvolvimento)
                        </summary>
                        <pre className="bg-gray-100 mt-2 p-2 rounded overflow-auto text-xs">
                            {error.message}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    )
}