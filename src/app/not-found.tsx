"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex justify-center items-center bg-gradient-to-br from-slate-50 dark:from-slate-900 via-blue-50 dark:via-slate-800 to-indigo-100 dark:to-slate-900 p-4 min-h-screen">
            <div className="mx-auto max-w-2xl text-center">
                {/* Ícone animado principal */}
                <div className="relative mb-8">
                    <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl mx-auto rounded-full w-32 h-32 animate-pulse">
                        <svg
                            className="w-16 h-16 text-white animate-bounce"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    {/* Círculos de fundo animados */}
                    <div className="absolute inset-0 -m-4">
                        <div className="opacity-20 mx-auto border-4 border-blue-200 dark:border-blue-800 rounded-full w-40 h-40 animate-ping"></div>
                    </div>
                    <div className="absolute inset-0 -m-8">
                        <div className="opacity-10 mx-auto border-2 border-purple-200 dark:border-purple-800 rounded-full w-48 h-48 animate-ping animation-delay-1000"></div>
                    </div>
                </div>

                {/* Título com efeito de digitação */}
                <div className="mb-6">
                    <h1 className="bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 font-bold text-transparent text-6xl md:text-8xl animate-fade-in">
                        404
                    </h1>
                    <h2 className="mb-2 font-semibold text-slate-700 dark:text-slate-300 text-2xl md:text-3xl animate-fade-in animation-delay-300">
                        Página não encontrada
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg animate-fade-in animation-delay-600">
                        Ops! Parece que você se perdeu no caminho das suas tarefas...
                    </p>
                </div>

                {/* Cards de sugestões animadas */}
                <div className="gap-4 grid md:grid-cols-3 mb-8 animate-fade-in animation-delay-900">
                    <div className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl p-6 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:-translate-y-1 duration-300">
                        <div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900 mx-auto mb-3 rounded-lg w-12 h-12">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Organize suas tarefas</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Volte ao dashboard e continue produtivo</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl p-6 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:-translate-y-1 duration-300">
                        <div className="flex justify-center items-center bg-green-100 dark:bg-green-900 mx-auto mb-3 rounded-lg w-12 h-12">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Acompanhe métricas</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Veja seu progresso e estatísticas</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl p-6 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:-translate-y-1 duration-300">
                        <div className="flex justify-center items-center bg-purple-100 dark:bg-purple-900 mx-auto mb-3 rounded-lg w-12 h-12">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Crie novos hábitos</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Desenvolva rotinas produtivas</p>
                    </div>
                </div>

                {/* Botão animado */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 hover:from-blue-700 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 py-4 rounded-full font-semibold text-white transition-all hover:-translate-y-1 duration-300 transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar ao Início
                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>

                {/* Elementos decorativos animados */}
                <div className="flex justify-center space-x-4 mt-12">
                    <div className="bg-blue-400 rounded-full w-3 h-3 animate-bounce animation-delay-0"></div>
                    <div className="bg-purple-400 rounded-full w-3 h-3 animate-bounce animation-delay-200"></div>
                    <div className="bg-green-400 rounded-full w-3 h-3 animate-bounce animation-delay-400"></div>
                    <div className="bg-yellow-400 rounded-full w-3 h-3 animate-bounce animation-delay-600"></div>
                    <div className="bg-pink-400 rounded-full w-3 h-3 animate-bounce animation-delay-800"></div>
                </div>

                {/* Texto adicional */}
                <p className="mt-8 text-slate-500 dark:text-slate-500 text-sm animate-fade-in animation-delay-1200">
                    Se você acredita que isso é um erro, entre em contato conosco
                </p>
            </div>
        </div>
    );
}