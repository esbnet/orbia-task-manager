// Shared i18n utilities (isomorphic - safe for server, client, and middleware)

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const locales = ["pt-BR", "en-US", "es-ES"] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = "pt-BR";

// Basic normalization from common tags to our supported locales
const aliasMap: Record<string, Locale> = {
    "pt": "pt-BR",
    "pt-br": "pt-BR",
    "en": "en-US",
    "en-us": "en-US",
    "es": "es-ES",
    "es-es": "es-ES",
};

export function normalizeLocale(input?: string | null): Locale | null {
    if (!input) return null;
    const lc = input.toLowerCase();
    if (aliasMap[lc]) return aliasMap[lc];
    const match = locales.find((l) => l.toLowerCase() === lc);
    return match ?? null;
}

export function detectLocaleFromHeader(acceptLanguage?: string | null): Locale {
    if (!acceptLanguage) return defaultLocale;
    try {
        // Example: "en-US,en;q=0.9,es;q=0.8"
        const parts = acceptLanguage.split(",").map((p) => p.trim());
        for (const part of parts) {
            const [tag] = part.split(";"); // ignore q
            const norm = normalizeLocale(tag);
            if (norm) return norm;
        }
    } catch {
        // ignore parsing errors
    }
    return defaultLocale;
}

export type Dict = Record<string, any>;

const dictionaries: Record<Locale, Dict> = {
    "pt-BR": {
        common: {
            comingSoon: "Em breve...",
            save: "Salvar",
            saving: "Salvando...",
            cancel: "Cancelar",
            delete: "Excluir",
            deleting: "Excluindo...",
            edit: "Editar",
            close: "Fechar",
            loading: "Carregando...",
            pickDate: "Escolher data",
            areYouSure: "Você tem certeza?",
            cannotUndo: "Confirmando a exclusão, você não poderá desfazer essa ação.",
        },
        navigation: {
            tasks: "Tarefas",
            performance: "Desempenho",
            metrics: "Métricas",
        },
        home: {
            title: "Dashboard",
        },
        tasks: {
            overview: "Visão Geral das Tarefas",
            overviewDescription: "Aqui está um resumo de todas as suas tarefas ativas.",
            overdueTasks: "Tarefas Atrasadas",
            pendingTasks: "Tarefas Pendentes",
            loadingTasks: "Carregando tarefas...",
            noActiveTasks: "Parabéns! Você não tem tarefas ativas no momento.",
            availableTasks: "disponíveis",
            completedToday: 'completadas hoje',
            overdue: "Atrasada",
            pending: "Pendente",
        },
        noTasks: {
            noTaskAvailable: "Nenhuma diário disponível",
            noTaskAvailableDescription: "Comece criando sua primeira diária para organizar sua rotina.",
            createTask: "Criar primeira diária",
        },
        forms: {
            title: "Título",
            observations: "Observação",
            taskList: "Lista de tarefas",
            difficulty: "Dificuldade",
            startDate: "Data de início",
            repeat: "Repetição",
            every: "A cada",
            tags: "Etiquetas",
            priority: "Prioridade",
            resetFrequency: "Frequência de Reset",
            addObservations: "Adicionar observações",
            addTags: "Adicionar etiquetas",
            newDaily: "Nova diária",
            newHabit: "Novo Hábito",
            editHabit: "Editar Hábito",
            editDaily: "Editar",
            editTodo: "Editar Afazer",
            editDetails: "Edite os detalhes da diária",
            changeDetails: "Altere os detalhes da tarefa",
            enterHabitTitle: "Digite o título do seu hábito",
            describeHabit: "Descreva seu hábito em detalhes",
            selectDifficulty: "Selecione a dificuldade",
            selectFrequency: "Selecione a frequência",
            selectPriority: "Selecione a prioridade",
        },
        difficulty: {
            trivial: "Trivial",
            easy: "Fácil",
            medium: "Média",
            hard: "Difícil",
        },
        repeat: {
            daily: "Diariamente",
            weekly: "Semanalmente",
            monthly: "Mensalmente",
            yearly: "Anualmente",
            day: "Dia",
            week: "Semana",
            month: "Mês",
            year: "Ano",
        },
        priority: {
            low: "Baixa",
            medium: "Média",
            high: "Alta",
            urgent: "Urgente",
        },
        taskTypes: {
            habit: "Hábito",
            daily: "Diária",
            todo: "Tarefa",
            goal: "Meta"
        },
        messages: {
            taskCreated: "Tarefa criada com sucesso!",
            taskRead: "Tarefa(s) carregada(s) com sucesso!",
            taskUpdated: "Tarefa atualizada com sucesso!",
            habitUpdated: "Hábito atualizado com sucesso!",
            taskDeleted: "Tarefa excluída com sucesso!",
            configSaved: "Configurações salvas com sucesso!",
            taskCompleted: "Tarefa concluída com sucesso!",
            errorSaving: "Erro ao salvar",
            errorDeleting: "Erro ao excluir",
            errorSavingConfig: "Erro ao salvar configurações",
            errorCompletingTask: "Erro ao concluir tarefa",
            errorLoadingData: "Erro ao carregar dados!"
        },
        delete: {
            deleteTask: "Delete esta tarefa",
            deleteHabit: "Deletar este hábito",
        },
        settings: {
            generalSettings: "Configurações Gerais",
            managePreferences: "Gerencie suas preferências pessoais e configurações da aplicação.",
            theme: "Tema",
            light: "Claro",
            dark: "Escuro",
            system: "Sistema",
            themeDescription: "Escolha o tema da interface ou deixe que siga as configurações do sistema.",
            language: "Idioma",
            languageDescription: "Idioma da interface da aplicação.",
            timezone: "Fuso Horário",
            timezoneDescription: "Fuso horário para exibição de datas e horários.",
            notifications: "Notificações",
            notificationsDescription: "Receber notificações da aplicação.",
            errorSavingSettings: "Erro ao salvar configurações:",
        },
        profile: {
            mustBeLoggedIn: "Você precisa estar logado para ver esta página.",
            statistics: "Estatísticas",
            activityChart: "Gráfico de Atividades",
            habitsTable: "Tabela de Hábitos",
            userAvatar: "Avatar do usuário",
        },
    },
    "en-US": {
        common: {
            comingSoon: "Coming soon...",
            save: "Save",
            saving: "Saving...",
            cancel: "Cancel",
            delete: "Delete",
            deleting: "Deleting...",
            edit: "Edit",
            close: "Close",
            loading: "Loading...",
            pickDate: "Pick a date",
            areYouSure: "Are you sure?",
            cannotUndo: "By confirming the deletion, you will not be able to undo this action.",
        },
        navigation: {
            tasks: "Tasks",
            performance: "Performance",
            metrics: "Metrics",
        },
        home: {
            title: "Dashboard",
        },
        tasks: {
            overview: "Tasks Overview",
            overviewDescription: "Here's a summary of all your active tasks.",
            overdueTasks: "Overdue Tasks",
            pendingTasks: "Pending Tasks",
            loadingTasks: "Loading tasks...",
            noActiveTasks: "Congratulations! You have no active tasks at the moment.",
            availableTasks: "available",
            completedToday: "completed today",
            overdue: "Overdue",
            pending: "Pending",
        },
        noTasks: {
            noTaskAvailable: "No diaries available.",
            noTaskAvailableDescription: "Start by creating your first diary to organize your routine.",
            createTask: "Create first diary.",
        },
        forms: {
            title: "Title",
            observations: "Observations",
            taskList: "Task list",
            difficulty: "Difficulty",
            startDate: "Start date",
            repeat: "Repeat",
            every: "Every",
            tags: "Tags",
            priority: "Priority",
            resetFrequency: "Reset Frequency",
            addObservations: "Add observations",
            addTags: "Add tags",
            newDaily: "New daily",
            newHabit: "New Habit",
            editHabit: "Edit Habit",
            editDaily: "Edit",
            editTodo: "Edit Todo",
            editDetails: "Edit daily details",
            changeDetails: "Change task details",
            enterHabitTitle: "Enter your habit title",
            describeHabit: "Describe your habit in detail",
            selectDifficulty: "Select difficulty",
            selectFrequency: "Select frequency",
            selectPriority: "Select priority",
        },
        difficulty: {
            trivial: "Trivial",
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
        },
        repeat: {
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
            yearly: "Yearly",
            day: "Day",
            week: "Week",
            month: "Month",
            year: "Year",
        },
        priority: {
            low: "Low",
            medium: "Medium",
            high: "High",
            urgent: "Urgent",
        },
        taskTypes: {
            habit: "Habit",
            daily: "Daily",
            todo: "Todo",
            goal: "Goal",
        },
        messages: {
            dailyCreated: "Daily created successfully!",
            dailyUpdated: "Daily updated successfully!",
            habitUpdated: "Habit updated successfully!",
            taskUpdated: "Task updated successfully!",
            taskDeleted: "Task deleted successfully!",
            habitDeleted: "Habit deleted successfully!",
            confirmDeletion: "Are you sure you want to remove this task? This action cannot be undone.",
            errorSaving: "Error saving",
            errorDeleting: "Error deleting",
            configSaved: "Settings saved successfully!",
            errorSavingConfig: "Error saving settings",
        },
        delete: {
            deleteTask: "Delete this task",
            deleteHabit: "Delete this habit",
        },
        settings: {
            generalSettings: "General Settings",
            managePreferences: "Manage your personal preferences and application settings.",
            theme: "Theme",
            light: "Light",
            dark: "Dark",
            system: "System",
            themeDescription: "Choose the interface theme or let it follow system settings.",
            language: "Language",
            languageDescription: "Application interface language.",
            timezone: "Timezone",
            timezoneDescription: "Timezone for displaying dates and times.",
            notifications: "Notifications",
            notificationsDescription: "Receive application notifications.",
            errorSavingSettings: "Error saving settings:",
        },
        profile: {
            mustBeLoggedIn: "You must be logged in to view this page.",
            statistics: "Statistics",
            activityChart: "Activity Chart",
            habitsTable: "Habits Table",
            userAvatar: "User avatar",
        },
    },
    "es-ES": {
        common: {
            comingSoon: "Próximamente...",
            save: "Guardar",
            saving: "Guardando...",
            cancel: "Cancelar",
            delete: "Eliminar",
            deleting: "Eliminando...",
            edit: "Editar",
            close: "Cerrar",
            loading: "Cargando...",
            pickDate: "Elegir fecha",
            areYouSure: "¿Estás seguro?",
            cannotUndo: "Al confirmar la eliminación, no podrás deshacer esta acción.",
        },
        navigation: {
            tasks: "Tareas",
            performance: "Rendimiento",
            metrics: "Métricas",
        },
        home: {
            title: "Panel",
        },
        tasks: {
            overview: "Resumen de Tareas",
            overviewDescription: "Aquí tienes un resumen de todas tus tareas activas.",
            overdueTasks: "Tareas Atrasadas",
            pendingTasks: "Tareas Pendientes",
            loadingTasks: "Cargando tareas...",
            noActiveTasks: "¡Felicidades! No tienes tareas activas en este momento.",
            availableTasks: "disponible",
            completedToday: "completado hoy",
            overdue: "Atrasada",
            pending: "Pendiente",
        },
        noTasks: {
            noTaskAvailable: "No hay diarios disponibles.",
            noTaskAvailableDescription: "Empieza creando tu primer diario para organizar tu rutina.",
            createTask: "Crear el primer diario",
        },
        forms: {
            title: "Título",
            observations: "Observaciones",
            taskList: "Lista de tareas",
            difficulty: "Dificultad",
            startDate: "Fecha de inicio",
            repeat: "Repetir",
            every: "Cada",
            tags: "Etiquetas",
            priority: "Prioridad",
            resetFrequency: "Frecuencia de Reinicio",
            addObservations: "Agregar observaciones",
            addTags: "Agregar etiquetas",
            newDaily: "Nueva diaria",
            newHabit: "Nuevo Hábito",
            editHabit: "Editar Hábito",
            editDaily: "Editar",
            editTodo: "Editar Tarea",
            editDetails: "Editar detalles de la diaria",
            changeDetails: "Cambiar detalles de la tarea",
            enterHabitTitle: "Ingresa el título de tu hábito",
            describeHabit: "Describe tu hábito en detalle",
            selectDifficulty: "Seleccionar dificultad",
            selectFrequency: "Seleccionar frecuencia",
            selectPriority: "Seleccionar prioridad",
        },
        difficulty: {
            trivial: "Trivial",
            easy: "Fácil",
            medium: "Medio",
            hard: "Difícil",
        },
        repeat: {
            daily: "Diariamente",
            weekly: "Semanalmente",
            monthly: "Mensualmente",
            yearly: "Anualmente",
            day: "Día",
            week: "Semana",
            month: "Mes",
            year: "Año",
        },
        priority: {
            low: "Baja",
            medium: "Media",
            high: "Alta",
            urgent: "Urgente",
        },
        taskTypes: {
            habit: "Hábito",
            daily: "Diaria",
            todo: "Tarea",
            goal: "Meta",
        },
        messages: {
            dailyCreated: "¡Diaria creada con éxito!",
            dailyUpdated: "¡Diaria actualizada con éxito!",
            habitUpdated: "¡Hábito actualizado con éxito!",
            taskUpdated: "¡Tarea actualizada con éxito!",
            taskDeleted: "¡Tarea eliminada con éxito!",
            habitDeleted: "¡Hábito eliminado con éxito!",
            errorSaving: "Error al guardar",
            errorDeleting: "Error al eliminar",
            configSaved: "¡Configuración guardada con éxito!",
            errorSavingConfig: "Error al guardar configuración",
        },
        delete: {
            deleteTask: "Eliminar esta tarea",
            deleteHabit: "Eliminar este hábito",
        },
        settings: {
            generalSettings: "Configuración General",
            managePreferences: "Gestiona tus preferencias personales y configuración de la aplicación.",
            theme: "Tema",
            light: "Claro",
            dark: "Oscuro",
            system: "Sistema",
            themeDescription: "Elige el tema de la interfaz o deja que siga la configuración del sistema.",
            language: "Idioma",
            languageDescription: "Idioma de la interfaz de la aplicación.",
            timezone: "Zona Horaria",
            timezoneDescription: "Zona horaria para mostrar fechas y horas.",
            notifications: "Notificaciones",
            notificationsDescription: "Recibir notificaciones de la aplicación.",
            errorSavingSettings: "Error al guardar configuración:",
        },
        profile: {
            mustBeLoggedIn: "Debes iniciar sesión para ver esta página.",
            statistics: "Estadísticas",
            activityChart: "Gráfico de Actividades",
            habitsTable: "Tabla de Hábitos",
            userAvatar: "Avatar de usuario",
        },
    },
};

export function getDictionary(locale: Locale): Dict {
    return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function deepGet(obj: any, path: string): any {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function format(str: string, params?: Record<string, string | number>): string {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

export function createTranslatorFromDict(dict: Dict) {
    return (key: string, params?: Record<string, string | number>) => {
        const value = deepGet(dict, key);
        if (typeof value === "string") return format(value, params);
        return key;
    };
}