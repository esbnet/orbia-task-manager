import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/infra/database/prisma/prisma-client";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get("timeRange") || "month";

        const performanceData = await calculatePerformanceMetrics(session.user.id, timeRange);
        return NextResponse.json(performanceData);
    } catch {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

async function calculatePerformanceMetrics(userId: string, timeRange: string) {
    const now = new Date();
    const startDate = getStartDate(timeRange, now);

    const [habitLogs, todoLogs, goals] = await Promise.all([
        prisma.habitLog.findMany({
            where: { habit: { userId }, completedAt: { gte: startDate, lte: now } },
            include: { habit: true },
        }),
        prisma.todoLog.findMany({
            where: { todo: { userId }, completedAt: { gte: startDate, lte: now } },
            include: { todo: true },
        }),
        prisma.goal.findMany({ where: { userId, targetDate: { gte: startDate, lte: now } } }),
    ]);

    const totalTasks = habitLogs.length + todoLogs.length;
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.status === "COMPLETED").length;

    const productivity = totalTasks > 0 ? Math.round((totalTasks / (totalTasks + 10)) * 100) : 0;
    const consistency = Math.round(calculateConsistency(habitLogs, todoLogs, startDate, now) * 100);
    const efficiency = calculateEfficiency(habitLogs, todoLogs);
    const goalAchievement = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const { weeklyTrend } = await calculateTrend(userId, startDate, now, totalTasks);
    const timeSeries = await generateTimeSeries(userId, timeRange, now);

    const completionLogs = {
        habits: habitLogs.map((log) => ({
            id: log.id,
            title: log.habitTitle || log.habit?.title || "Hábito",
            completedAt: log.completedAt,
            difficulty: log.difficulty || log.habit?.difficulty || "Fácil",
            tags: log.tags || log.habit?.tags || [],
            type: "habit" as const,
        })),
        todos: todoLogs.map((log) => ({
            id: log.id,
            title: log.todoTitle || log.todo?.title || "Tarefa",
            completedAt: log.completedAt,
            difficulty: log.difficulty || log.todo?.difficulty || "Médio",
            tags: log.tags || log.todo?.tags || [],
            type: "todo" as const,
        })),
        goals: goals
            .filter((goal) => goal.status === "COMPLETED")
            .map((goal) => ({
                id: goal.id,
                title: goal.title,
                completedAt: goal.updatedAt || goal.targetDate || new Date(),
                difficulty: goal.priority || "Média",
                tags: goal.tags || [],
                type: "goal" as const,
            })),
    };

    const tagAnalysis = await calculateTagAnalysis(habitLogs, todoLogs, goals);

    return {
        metrics: {
            productivity: clampPercent(productivity),
            consistency: clampPercent(consistency),
            efficiency: clampPercent(efficiency),
            goalAchievement: clampPercent(goalAchievement),
            weeklyTrend,
            monthlyTrend: Math.floor(weeklyTrend * 0.8),
            averageTaskTime: calculateAverageTaskTime(habitLogs, todoLogs),
            completionRate: Math.round((productivity + consistency + efficiency) / 3),
            streakDays: Math.max(1, Math.floor(totalTasks / 3)),
            bestDayOfWeek: findBestDayOfWeek(habitLogs, todoLogs),
        },
        timeSeries,
        categoryPerformance: [
            {
                category: "Hábitos",
                completionRate: calculateCategoryCompletionRate(habitLogs),
                averageTime: 15,
                totalTasks: habitLogs.length,
            },
            {
                category: "Tarefas",
                completionRate: calculateCategoryCompletionRate(todoLogs),
                averageTime: 30,
                totalTasks: todoLogs.length,
            },
            {
                category: "Metas",
                completionRate: goalAchievement,
                averageTime: 60,
                totalTasks: totalGoals,
            },
        ],
        tagAnalysis,
        priorityAnalysis: [
            { label: "Baixa", value: goals.filter((g) => g.priority === "LOW").length },
            { label: "Média", value: goals.filter((g) => g.priority === "MEDIUM").length },
            { label: "Alta", value: goals.filter((g) => g.priority === "HIGH").length },
            { label: "Urgente", value: goals.filter((g) => g.priority === "URGENT").length },
        ],
        difficultyAnalysis: [
            { label: "Trivial", value: countDifficulty(habitLogs, todoLogs, "Trivial") },
            { label: "Fácil", value: countDifficulty(habitLogs, todoLogs, "Fácil") },
            { label: "Médio", value: countDifficulty(habitLogs, todoLogs, "Médio") },
            { label: "Difícil", value: countDifficulty(habitLogs, todoLogs, "Difícil") },
        ],
        completionLogs,
        insights: buildInsights(totalTasks, completedGoals, totalGoals),
        predictions: {
            nextWeekScore: clampPercent(Math.round(productivity * 0.9 + consistency * 0.1)),
            recommendedGoals: [
                "Priorize tarefas com maior impacto no dia.",
                "Mantenha consistência em hábitos de alta relevância.",
            ],
            riskAreas: totalTasks < 5 ? ["Baixo volume de execução no período"] : [],
        },
    };
}

function getStartDate(timeRange: string, now: Date) {
    const date = new Date(now);
    if (timeRange === "week") date.setDate(now.getDate() - 7);
    else if (timeRange === "month") date.setDate(now.getDate() - 30);
    else if (timeRange === "quarter") date.setDate(now.getDate() - 90);
    return date;
}

function clampPercent(value: number) {
    return Math.max(0, Math.min(100, value));
}

function calculateConsistency(habitLogs: any[], todoLogs: any[], startDate: Date, endDate: Date) {
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
    const activeDays = new Set<string>();
    [...habitLogs, ...todoLogs].forEach((log) => activeDays.add(log.completedAt.toISOString().split("T")[0]));
    return activeDays.size / totalDays;
}

function calculateEfficiency(habitLogs: any[], todoLogs: any[]) {
    const weights: Record<string, number> = { Trivial: 0.5, "Fácil": 1, "Médio": 2, "Difícil": 3 };
    const all = [...habitLogs, ...todoLogs];
    if (!all.length) return 0;
    const total = all.reduce((acc, log) => acc + (weights[log.difficulty] || 1), 0);
    return Math.round((total / all.length) * 30);
}

async function calculateTrend(userId: string, startDate: Date, now: Date, currentTotal: number) {
    const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / 86400000);
    const prevStart = new Date(startDate);
    const prevEnd = new Date(startDate);
    prevStart.setDate(prevStart.getDate() - periodDays);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const [prevHabits, prevTodos] = await Promise.all([
        prisma.habitLog.count({ where: { habit: { userId }, completedAt: { gte: prevStart, lte: prevEnd } } }),
        prisma.todoLog.count({ where: { todo: { userId }, completedAt: { gte: prevStart, lte: prevEnd } } }),
    ]);

    const previousTotal = prevHabits + prevTodos;
    const weeklyTrend = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 0;
    return { weeklyTrend };
}

async function generateTimeSeries(userId: string, timeRange: string, now: Date) {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const [habits, todos] = await Promise.all([
            prisma.habitLog.count({ where: { habit: { userId }, completedAt: { gte: dayStart, lte: dayEnd } } }),
            prisma.todoLog.count({ where: { todo: { userId }, completedAt: { gte: dayStart, lte: dayEnd } } }),
        ]);

        const completed = habits + todos;
        const planned = Math.max(completed + 1, completed);
        const efficiency = planned > 0 ? Math.floor((completed / planned) * 100) : 0;

        data.push({
            date: date.toISOString().split("T")[0],
            completed,
            planned,
            efficiency,
            score: clampPercent(Math.floor((efficiency + completed * 4) / 2)),
        });
    }

    return data;
}

function findBestDayOfWeek(habitLogs: any[], todoLogs: any[]) {
    const dayCounts: Record<number, number> = {};
    [...habitLogs, ...todoLogs].forEach((log) => {
        const day = log.completedAt.getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const bestDay = Object.keys(dayCounts).reduce((a, b) => (dayCounts[+a] > dayCounts[+b] ? a : b), "1");
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days[+bestDay] || "Segunda";
}

function calculateAverageTaskTime(habitLogs: any[], todoLogs: any[]) {
    const totalTasks = habitLogs.length + todoLogs.length;
    if (!totalTasks) return 0;
    return Math.round((habitLogs.length * 15 + todoLogs.length * 30) / totalTasks);
}

function calculateCategoryCompletionRate(logs: any[]) {
    if (!logs.length) return 0;
    return Math.min(100, 65 + Math.min(35, logs.length));
}

function countDifficulty(habitLogs: any[], todoLogs: any[], difficulty: string) {
    return [...habitLogs, ...todoLogs].filter((log) => log.difficulty === difficulty).length;
}

async function calculateTagAnalysis(habitLogs: any[], todoLogs: any[], goals: any[]) {
    const tagsMap = new Map<string, number>();
    [...habitLogs, ...todoLogs].forEach((log) => {
        (log.tags || []).forEach((tag: string) => tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1));
    });
    goals.forEach((goal) => {
        (goal.tags || []).forEach((tag: string) => tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1));
    });

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return [...tagsMap.entries()].slice(0, 10).map(([tag, count], idx) => ({
        tag,
        count,
        color: colors[idx % colors.length],
    }));
}

function buildInsights(totalTasks: number, completedGoals: number, totalGoals: number) {
    const insights = [];
    if (totalTasks >= 20) {
        insights.push({
            type: "performance",
            title: "Ritmo elevado de execução",
            description: "Seu volume de tarefas concluídas está alto no período.",
            recommendation: "Mantenha a cadência e revise prioridades semanalmente.",
            impact: "high",
        });
    }
    if (totalGoals > 0) {
        insights.push({
            type: "goals",
            title: "Evolução de metas",
            description: `Você concluiu ${completedGoals} de ${totalGoals} metas no período.`,
            recommendation: "Divida metas maiores em marcos semanais.",
            impact: "medium",
        });
    }
    return insights;
}
