export default function HomeOpenclawAlternative() {
    const capabilityCards = [
        {
            title: "Clareza diária",
            description:
                "Orbia transforma a sua lista do dia em um plano de ação simples, com prioridade visível desde o primeiro minuto.",
        },
        {
            title: "Execução sem ruído",
            description:
                "Hábitos, tarefas e metas vivem no mesmo fluxo para você manter foco sem trocar de contexto o tempo todo.",
        },
        {
            title: "Consistência mensurável",
            description:
                "Acompanhe evolução diária e semanal com sinais claros do que está avançando e do que precisa de ajuste.",
        },
    ];

    const integrations = [
        "Metas",
        "Hábitos",
        "Tarefas",
        "Etiquetas",
        "Resumo diário",
        "Visão semanal",
        "Prioridades",
        "Frequência",
        "Relatórios",
        "Notificações",
        "Perfil",
        "Configurações",
    ];

    const usageScenarios = [
        {
            title: "Revisão matinal",
            description:
                "Abra o dia com prioridades organizadas, tarefas críticas em destaque e visão objetiva do que precisa ser concluído.",
        },
        {
            title: "Ritmo semanal",
            description:
                "Conecte metas e hábitos para manter constância ao longo da semana sem abrir mão de flexibilidade.",
        },
        {
            title: "Ajuste de rota",
            description:
                "Use os indicadores de desempenho para corrigir desvios cedo e preservar progresso sem sobrecarga.",
        },
    ];

    return (
        <section className="relative flex flex-col gap-8 mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full max-w-[1200px] min-h-screen">
            <div className="-z-10 absolute inset-0 overflow-hidden pointer-events-none">
                <div className="top-10 -left-32 absolute bg-[radial-gradient(circle,rgba(255,170,38,0.35)_0%,rgba(255,170,38,0)_70%)] blur-2xl rounded-full w-72 h-72" />
                <div className="top-56 right-0 absolute bg-[radial-gradient(circle,rgba(50,120,255,0.22)_0%,rgba(50,120,255,0)_70%)] blur-2xl rounded-full w-80 h-80" />
            </div>

            <header className="bg-[linear-gradient(120deg,rgba(255,255,255,0.96)_0%,rgba(255,244,220,0.96)_50%,rgba(255,255,255,0.96)_100%)] dark:bg-[linear-gradient(120deg,rgba(22,22,22,0.96)_0%,rgba(45,33,17,0.93)_45%,rgba(17,17,17,0.96)_100%)] shadow-[0_30px_90px_-45px_rgba(15,15,15,0.35)] p-6 sm:p-10 border border-black/10 dark:border-white/10 rounded-3xl orbia-alt-reveal">
                <p className="font-semibold text-zinc-600 dark:text-zinc-300 text-xs uppercase tracking-[0.26em]">
                    Orbia • rotina, foco e progresso
                </p>

                <h1
                    className="mt-4 max-w-4xl font-semibold text-zinc-950 dark:text-zinc-100 text-4xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-tight"
                    style={{ fontFamily: '"Space Grotesk", "Sora", "Avenir Next", "Segoe UI", sans-serif' }}
                >
                    Menos atrito no planejamento. Mais consistência na execução.
                </h1>

                <p className="mt-5 max-w-2xl text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
                    O Orbia conecta hábitos, tarefas e metas em uma única cadência. Você ganha clareza para decidir rápido e energia para avançar no que realmente importa.
                </p>

                <div className="flex sm:flex-row flex-col gap-3 mt-8">
                    <a
                        href="/tasks"
                        className="inline-flex justify-center items-center bg-zinc-950 dark:bg-white px-6 py-3 rounded-full font-semibold text-white dark:text-zinc-950 text-sm transition-transform hover:-translate-y-0.5 duration-200"
                    >
                        Abrir meu plano de hoje
                    </a>
                    <a
                        href="/metrics"
                        className="inline-flex justify-center items-center bg-white/70 hover:bg-white dark:bg-zinc-900/60 dark:hover:bg-zinc-900 px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-full font-semibold text-zinc-900 dark:text-zinc-100 text-sm transition-colors duration-200"
                    >
                        Ver evolução da semana
                    </a>
                </div>
            </header>

            <section className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 orbia-alt-reveal" aria-label="O que o Orbia faz">
                {capabilityCards.map((item) => (
                    <article
                        key={item.title}
                        className="bg-white/90 dark:bg-zinc-900/70 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)] backdrop-blur-sm p-5 border border-black/10 dark:border-white/10 rounded-2xl"
                    >
                        <h2 className="font-semibold text-zinc-950 dark:text-zinc-100 text-lg">{item.title}</h2>
                        <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{item.description}</p>
                    </article>
                ))}
            </section>

            <section className="bg-zinc-950 p-6 sm:p-8 border border-black/10 dark:border-white/10 rounded-3xl text-white orbia-alt-reveal">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                    <div>
                        <p className="text-zinc-400 text-xs uppercase tracking-[0.24em]">Funciona com tudo dentro do app</p>
                        <h3 className="mt-2 font-semibold text-2xl sm:text-3xl">Um sistema único para organizar sua rotina</h3>
                    </div>
                    <a href="/profile" className="font-medium text-amber-300 hover:text-amber-200 text-sm">
                        Ver meu perfil
                    </a>
                </div>

                <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mt-6">
                    {integrations.map((item) => (
                        <div
                            key={item}
                            className="bg-white/5 px-4 py-3 border border-white/10 rounded-xl font-medium text-zinc-100 text-sm text-center"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[linear-gradient(180deg,rgba(255,250,240,0.95)_0%,rgba(255,255,255,0.95)_100%)] dark:bg-[linear-gradient(180deg,rgba(35,26,14,0.6)_0%,rgba(20,20,20,0.8)_100%)] p-6 sm:p-8 border border-black/10 dark:border-white/10 rounded-3xl orbia-alt-reveal">
                <p className="text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-[0.24em]">Como isso aparece na prática</p>
                <h3 className="mt-2 font-semibold text-zinc-950 dark:text-zinc-100 text-2xl sm:text-3xl">
                    Fluxos reais para manter ritmo sustentável
                </h3>

                <div className="gap-4 grid lg:grid-cols-3 mt-6">
                    {usageScenarios.map((item) => (
                        <article key={item.title} className="bg-white/90 dark:bg-zinc-900/70 p-5 border border-black/10 dark:border-white/10 rounded-2xl">
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">{item.title}</h4>
                            <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 mb-6 p-6 sm:p-8 border border-black/10 dark:border-white/10 rounded-3xl orbia-alt-reveal">
                <h3 className="font-semibold text-zinc-950 dark:text-zinc-100 text-2xl sm:text-3xl">Pronto para transformar intenção em entrega?</h3>
                <p className="mt-3 max-w-2xl text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                    Defina prioridades, revise metas e mantenha consistência com um fluxo que acompanha seu ritmo real de trabalho.
                </p>

                <div className="flex sm:flex-row flex-col gap-3 mt-6">
                    <a
                        href="/goals"
                        className="inline-flex justify-center items-center bg-amber-400 hover:bg-amber-300 px-6 py-3 rounded-full font-semibold text-zinc-950 text-sm transition-colors"
                    >
                        Revisar metas
                    </a>
                    <a
                        href="/settings"
                        className="inline-flex justify-center items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-full font-semibold text-zinc-900 dark:text-zinc-100 text-sm"
                    >
                        Ajustar meu ambiente
                    </a>
                </div>
            </section>
        </section>
    );
}